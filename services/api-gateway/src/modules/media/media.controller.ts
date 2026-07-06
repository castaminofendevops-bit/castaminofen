import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaService } from './media.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/utils/response.util';

class PlaybackUpdateBody {
  @Type(() => Number)
  @IsNumber()
  position!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  duration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playbackSpeed?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsString()
  deviceId?: string;
}

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get('stream/:episodeId')
  @Auth()
  @ApiOperation({ summary: 'دریافت URL استریم (signed)' })
  async stream(@CurrentUser('id') userId: string, @Param('episodeId') episodeId: string) {
    return successResponse(await this.mediaService.getStreamUrl(episodeId, userId));
  }

  @Post('playback/:episodeId')
  @Auth()
  @ApiOperation({ summary: 'همگام‌سازی وضعیت پخش' })
  async updatePlayback(
    @CurrentUser('id') userId: string,
    @Param('episodeId') episodeId: string,
    @Body() body: PlaybackUpdateBody,
  ) {
    return successResponse(await this.mediaService.updatePlayback(userId, episodeId, body));
  }

  @Get('continue')
  @Auth()
  @ApiOperation({ summary: 'ادامه گوش دادن' })
  async continueListening(@CurrentUser('id') userId: string, @Query('limit') limit?: number) {
    return successResponse(await this.mediaService.getContinueListening(userId, limit || 10));
  }

  @Post('download/:episodeId')
  @Auth()
  @ApiOperation({ summary: 'درخواست دانلود آفلاین' })
  async download(
    @CurrentUser('id') userId: string,
    @Param('episodeId') episodeId: string,
    @Query('quality') quality?: string,
  ) {
    return successResponse(await this.mediaService.requestDownload(userId, episodeId, quality));
  }

  @Get('downloads')
  @Auth()
  @ApiOperation({ summary: 'لیست دانلودها' })
  async downloads(@CurrentUser('id') userId: string) {
    return successResponse(await this.mediaService.getDownloads(userId));
  }
}
