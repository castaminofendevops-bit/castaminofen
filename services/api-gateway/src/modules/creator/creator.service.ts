import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class CreatorService {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  async requestCreator(userId: string, data: { fullName: string; bio?: string; sampleUrl?: string }, idFile?: Express.Multer.File) {
    let idFileUrl: string | undefined = undefined;
    if (idFile) {
      const key = `creator-requests/${userId}/${Date.now()}-${idFile.originalname}`;
      const uploaded = await this.storage.uploadObject(key, idFile.buffer, idFile.mimetype || 'application/octet-stream');
      idFileUrl = uploaded.url || uploaded.Location || uploaded.key || key;
    }

    // Persist request
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
}
