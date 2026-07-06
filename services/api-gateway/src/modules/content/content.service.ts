import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateContentDto, CreateEpisodeDto, ExploreQueryDto, SearchQueryDto } from './content.dto';
import { paginate } from '../../common/utils/response.util';
import { ContentStatus } from '@castaminofen/database';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getTrending(limit = 8) {
    const items = await this.prisma.content.findMany({
      where: { status: ContentStatus.PUBLISHED },
      take: limit,
      orderBy: [{ episodeCount: 'desc' }, { publishedAt: 'desc' }],
      include: {
        creator: { include: { user: { select: { displayName: true, avatarUrl: true } } } },
        _count: { select: { episodes: true } },
      },
    });
    return items.map(this.formatContent);
  }

  async getRelated(contentId: string, limit = 6) {
    const source = await this.prisma.content.findFirst({
      where: { id: contentId, status: ContentStatus.PUBLISHED },
      select: { id: true, type: true, creatorId: true },
    });
    if (!source) throw new NotFoundException('Content not found');

    const items = await this.prisma.content.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        id: { not: contentId },
        OR: [{ type: source.type }, { creatorId: source.creatorId }],
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        creator: { include: { user: { select: { displayName: true, avatarUrl: true } } } },
        _count: { select: { episodes: true } },
      },
    });
    return items.map(this.formatContent);
  }

  async explore(query: ExploreQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      status: ContentStatus.PUBLISHED,
      ...(query.type && { type: query.type as never }),
    };

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          creator: { include: { user: { select: { displayName: true, avatarUrl: true } } } },
          _count: { select: { episodes: true } },
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      items: items.map(this.formatContent),
      meta: paginate(page, limit, total),
    };
  }

  async search(query: SearchQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const term = query.q.trim();

    const [contents, episodes, creators] = await Promise.all([
      this.prisma.content.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          ...(query.type && { type: query.type as never }),
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
        include: {
          creator: { include: { user: { select: { displayName: true, avatarUrl: true } } } },
        },
      }),
      this.prisma.episode.findMany({
        where: {
          title: { contains: term, mode: 'insensitive' },
          content: { status: ContentStatus.PUBLISHED },
        },
        take: limit,
        include: { content: { select: { id: true, title: true } } },
      }),
      this.prisma.creatorProfile.findMany({
        where: {
          OR: [
            { slug: { contains: term, mode: 'insensitive' } },
            { user: { displayName: { contains: term, mode: 'insensitive' } } },
          ],
        },
        take: limit,
        include: { user: { select: { displayName: true, avatarUrl: true } } },
      }),
    ]);

    return {
      contents: contents.map(this.formatContent),
      episodes: episodes.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        duration: e.duration,
        episodeNumber: e.episodeNumber,
        contentId: e.contentId,
        contentTitle: e.content.title,
        isVideo: e.isVideo,
      })),
      creators: creators.map((c) => ({
        id: c.id,
        slug: c.slug,
        displayName: c.user.displayName,
        avatarUrl: c.user.avatarUrl,
        isVerified: c.isVerified,
      })),
    };
  }

  async getContent(id: string) {
    const content = await this.prisma.content.findFirst({
      where: { id, status: ContentStatus.PUBLISHED },
      include: {
        creator: { include: { user: { select: { displayName: true, avatarUrl: true } } } },
        episodes: { orderBy: { episodeNumber: 'asc' } },
        tags: { include: { tag: true } },
      },
    });
    if (!content) throw new NotFoundException('Content not found');
    return {
      ...this.formatContent(content),
      description: content.description,
      episodes: content.episodes,
      tags: content.tags.map((t) => t.tag),
    };
  }

  async getEpisode(id: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
      include: {
        content: {
          include: { creator: { include: { user: { select: { displayName: true } } } } },
        },
      },
    });
    if (!episode) throw new NotFoundException('Episode not found');
    return episode;
  }

  async createContent(creatorId: string, dto: CreateContentDto) {
    const slug = dto.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '');

    return this.prisma.content.create({
      data: {
        creatorId,
        type: dto.type as never,
        title: dto.title,
        slug: `${slug}-${Date.now()}`,
        description: dto.description,
        isPremium: dto.isPremium ?? false,
        price: dto.price,
        status: ContentStatus.DRAFT,
      },
    });
  }

  async addEpisode(contentId: string, creatorId: string, dto: CreateEpisodeDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, creatorId },
    });
    if (!content) throw new ForbiddenException('Not your content');

    const slug = dto.title.toLowerCase().replace(/\s+/g, '-');
    const episode = await this.prisma.episode.create({
      data: {
        contentId,
        title: dto.title,
        slug: `${slug}-${dto.episodeNumber}`,
        episodeNumber: dto.episodeNumber,
        description: dto.description,
        duration: dto.duration ?? 0,
        mediaUrl: dto.mediaUrl,
        isVideo: dto.isVideo ?? false,
      },
    });

    await this.prisma.content.update({
      where: { id: contentId },
      data: {
        episodeCount: { increment: 1 },
        totalDuration: { increment: dto.duration ?? 0 },
      },
    });

    return episode;
  }

  async publishContent(contentId: string, creatorId: string) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, creatorId },
    });
    if (!content) throw new ForbiddenException('Not your content');

    return this.prisma.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async getCreatorContents(userId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException('Creator profile required');

    return this.prisma.content.findMany({
      where: { creatorId: profile.id },
      include: { _count: { select: { episodes: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCreatorContentDetail(contentId: string, userId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException('Creator profile required');

    const content = await this.prisma.content.findFirst({
      where: { id: contentId, creatorId: profile.id },
      include: {
        episodes: { orderBy: { episodeNumber: 'asc' } },
        _count: { select: { episodes: true } },
      },
    });
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  private formatContent(content: {
    id: string;
    type: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    isPremium: boolean;
    episodeCount?: number;
    creator: {
      id: string;
      slug: string;
      isVerified: boolean;
      user: { displayName: string; avatarUrl: string | null };
    };
    _count?: { episodes: number };
  }) {
    return {
      id: content.id,
      type: content.type,
      title: content.title,
      slug: content.slug,
      coverUrl: content.coverUrl,
      isPremium: content.isPremium,
      episodeCount: content.episodeCount ?? content._count?.episodes ?? 0,
      creator: {
        id: content.creator.id,
        slug: content.creator.slug,
        displayName: content.creator.user.displayName,
        avatarUrl: content.creator.user.avatarUrl,
        isVerified: content.creator.isVerified,
      },
    };
  }
}
