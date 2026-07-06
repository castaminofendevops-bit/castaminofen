import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class CreatorService {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  async requestCreator(userId: string, data: { fullName: string; bio?: string; sampleUrl?: string }, idFile?: Express.Multer.File) {
    const existing = await this.prisma.creatorRequest.findFirst({ where: { userId, status: 'PENDING' } });
    if (existing) throw new ConflictException('درخواست قبلی هنوز در حال بررسی است');

    let idFileUrl: string | undefined = undefined;
    if (idFile) {
      const key = `creator-requests/${userId}/${Date.now()}-${idFile.originalname}`;
      const uploaded = await this.storage.uploadObject(key, idFile.buffer, idFile.mimetype || 'application/octet-stream');
      idFileUrl = uploaded.mediaUrl || uploaded.url || uploaded.Location || uploaded.key || key;
    }

    try {
      return this.prisma.creatorRequest.create({
        data: {
          userId,
          fullName: data.fullName,
          bio: data.bio,
          sampleUrl: data.sampleUrl,
          idFileUrl,
        },
      });
    } catch (err) {
      throw new BadRequestException('Unable to create creator request');
    }
  }

  async getMyRequest(userId: string) {
    return this.prisma.creatorRequest.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async getRequests() {
    return this.prisma.creatorRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, displayName: true } } },
    });
  }

  async reviewRequest(id: string, action: 'APPROVE' | 'REJECT', reviewComment?: string) {
    const request = await this.prisma.creatorRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('درخواست یافت نشد');
    if (request.status !== 'PENDING') throw new ConflictException('درخواست قبلاً بررسی شده است');

    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updateData: any = { status, reviewComment };
    const updatedRequest = await this.prisma.creatorRequest.update({ where: { id }, data: updateData });

    if (status === 'APPROVED') {
      const user = await this.prisma.user.update({ where: { id: request.userId }, data: { role: 'CREATOR' } });
      await this.prisma.creatorProfile.upsert({
        where: { userId: user.id },
        update: { bio: request.bio ?? undefined },
        create: { userId: user.id, slug: `creator-${user.id}`, bio: request.bio ?? undefined },
      });
    }

    return updatedRequest;
  }
}
