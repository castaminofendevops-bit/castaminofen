import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlaylistDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class AddToPlaylistDto {
  @ApiProperty()
  @IsString()
  episodeId!: string;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async followCreator(userId: string, creatorId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { id: creatorId } });
    if (!creator) throw new NotFoundException('Creator not found');

    try {
      return await this.prisma.follow.create({ data: { userId, creatorId } });
    } catch {
      throw new ConflictException('Already following');
    }
  }

  async unfollowCreator(userId: string, creatorId: string) {
    await this.prisma.follow.deleteMany({ where: { userId, creatorId } });
    return { unfollowed: true };
  }

  async getFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { userId },
      include: {
        creator: {
          include: { user: { select: { displayName: true, avatarUrl: true } } },
        },
      },
    });
  }

  async addToLibrary(userId: string, contentId: string) {
    const content = await this.prisma.content.findUnique({ where: { id: contentId } });
    if (!content) throw new NotFoundException('Content not found');

    try {
      return await this.prisma.libraryItem.create({ data: { userId, contentId } });
    } catch {
      throw new ConflictException('Already in library');
    }
  }

  async removeFromLibrary(userId: string, contentId: string) {
    const deleted = await this.prisma.libraryItem.deleteMany({ where: { userId, contentId } });
    if (deleted.count === 0) throw new NotFoundException('Not in library');
    return { removed: true };
  }

  async getLibrary(userId: string) {
    return this.prisma.libraryItem.findMany({
      where: { userId },
      include: {
        content: {
          include: {
            creator: { include: { user: { select: { displayName: true } } } },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });
  }

  async createPlaylist(userId: string, dto: CreatePlaylistDto) {
    return this.prisma.playlist.create({
      data: { userId, title: dto.title, description: dto.description },
    });
  }

  async getPlaylists(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async addToPlaylist(userId: string, playlistId: string, episodeId: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId, userId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');

    const count = await this.prisma.playlistItem.count({ where: { playlistId } });
    return this.prisma.playlistItem.create({
      data: { playlistId, episodeId, position: count },
    });
  }

  async getPlaylist(userId: string, playlistId: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId, userId },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            episode: {
              include: { content: { select: { title: true, coverUrl: true } } },
            },
          },
        },
      },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    return playlist;
  }
}
