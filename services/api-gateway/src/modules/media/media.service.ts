import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StreamUrlResponse } from '@castaminofen/shared';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async getStreamUrl(episodeId: string, userId?: string): Promise<StreamUrlResponse> {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        content: {
          include: { creator: true },
        },
      },
    });
    if (!episode) throw new NotFoundException('Episode not found');

    if (episode.isPremium || episode.content.isPremium) {
      await this.verifyAccess(userId, episode.content.id, episode.content.isPremium);
    }

    const baseUrl = episode.mediaUrl || this.buildSignedUrl(episode.mediaKey || episode.id);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.MEDIA_URL_EXPIRY_SECONDS || '3600', 10) * 1000));

    return {
      url: baseUrl,
      expiresAt: expiresAt.toISOString(),
      contentType: episode.isVideo ? 'video/mp4' : 'audio/mpeg',
      duration: episode.duration,
    };
  }

  async updatePlayback(
    userId: string,
    episodeId: string,
    data: {
      position: number;
      duration?: number;
      playbackSpeed?: number;
      isCompleted?: boolean;
      deviceId?: string;
    },
  ) {
    const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
    if (!episode) throw new NotFoundException('Episode not found');

    return this.prisma.playbackState.upsert({
      where: { userId_episodeId: { userId, episodeId } },
      create: {
        userId,
        episodeId,
        position: data.position,
        duration: data.duration ?? episode.duration,
        playbackSpeed: data.playbackSpeed ?? 1,
        isCompleted: data.isCompleted ?? false,
        deviceId: data.deviceId,
      },
      update: {
        position: data.position,
        duration: data.duration,
        playbackSpeed: data.playbackSpeed,
        isCompleted: data.isCompleted,
        deviceId: data.deviceId,
        lastPlayedAt: new Date(),
      },
    });
  }

  async getContinueListening(userId: string, limit = 10) {
    return this.prisma.playbackState.findMany({
      where: { userId, isCompleted: false },
      orderBy: { lastPlayedAt: 'desc' },
      take: limit,
      include: {
        episode: {
          include: {
            content: {
              select: { id: true, title: true, coverUrl: true, type: true },
            },
          },
        },
      },
    });
  }

  async requestDownload(userId: string, episodeId: string, quality = 'medium') {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: { content: true },
    });
    if (!episode) throw new NotFoundException('Episode not found');

    if (episode.isPremium || episode.content.isPremium) {
      await this.verifyAccess(userId, episode.content.id, episode.content.isPremium);
    }

    const stream = await this.getStreamUrl(episodeId, userId);

    return this.prisma.download.upsert({
      where: { userId_episodeId: { userId, episodeId } },
      create: {
        userId,
        episodeId,
        status: 'COMPLETED',
        quality,
        fileSize: 0,
        localPath: stream.url,
        completedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        quality,
        localPath: stream.url,
        completedAt: new Date(),
      },
    });
  }

  async getDownloads(userId: string) {
    return this.prisma.download.findMany({
      where: { userId, status: 'COMPLETED' },
      include: {
        episode: {
          include: { content: { select: { title: true, coverUrl: true } } },
        },
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  private async verifyAccess(userId: string | undefined, contentId: string, isPremium: boolean) {
    if (!userId) throw new ForbiddenException('Authentication required');

    if (isPremium) {
      const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
      if (subscription?.plan === 'PREMIUM' && subscription.status === 'ACTIVE') return;

      const purchase = await this.prisma.purchase.findFirst({
        where: { userId, contentId, status: 'COMPLETED' },
      });
      if (purchase) return;

      throw new ForbiddenException('Premium or purchase required');
    }
  }

  private buildSignedUrl(mediaKey: string): string {
    const secret = process.env.MEDIA_SIGNING_SECRET || 'dev-media-secret';
    const expiry = Math.floor(Date.now() / 1000) + 3600;
    const signature = createHmac('sha256', secret)
      .update(`${mediaKey}:${expiry}`)
      .digest('hex');

    const base = process.env.S3_PUBLIC_URL || 'http://localhost:9000/castaminofen-media';
    return `${base}/${mediaKey}?expires=${expiry}&sig=${signature}`;
  }
}
