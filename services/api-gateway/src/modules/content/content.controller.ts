import { Controller, Get, Post, Param, Body, Query, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContentService } from './content.service';
import {
  SearchQueryDto,
  ExploreQueryDto,
  CreateContentDto,
  CreateEpisodeDto,
  CreatorUploadUrlDto,
} from './content.dto';
import { Auth, Public } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/utils/response.util';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';

type UploadedMediaFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

@ApiTags('Content')
@Controller()
export class ContentController {
  constructor(
    private contentService: ContentService,
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'محتوای پرطرفدار' })
  async trending() {
    return successResponse(await this.contentService.getTrending());
  }

  @Public()
  @Get('explore')
  @ApiOperation({ summary: 'کشف محتوا' })
  async explore(@Query() query: ExploreQueryDto) {
    const result = await this.contentService.explore(query);
    return successResponse(result.items, result.meta);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'جستجو' })
  async search(@Query() query: SearchQueryDto) {
    return successResponse(await this.contentService.search(query));
  }

  @Public()
  @Get('contents/:id/related')
  @ApiOperation({ summary: 'محتوای مرتبط' })
  async getRelated(@Param('id') id: string) {
    return successResponse(await this.contentService.getRelated(id));
  }

  @Public()
  @Get('contents/:id')
  @ApiOperation({ summary: 'جزئیات محتوا' })
  async getContent(@Param('id') id: string) {
    return successResponse(await this.contentService.getContent(id));
  }

  @Public()
  @Get('episodes/:id')
  @ApiOperation({ summary: 'جزئیات اپیزود' })
  async getEpisode(@Param('id') id: string) {
    return successResponse(await this.contentService.getEpisode(id));
  }

  @Post('creator/contents')
  @Auth('CREATOR', 'ADMIN')
  @ApiOperation({ summary: 'ایجاد محتوا (سازنده)' })
  async createContent(@CurrentUser('id') userId: string, @Body() dto: CreateContentDto) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Creator profile required');
    return successResponse(await this.contentService.createContent(profile.id, dto));
  }

  @Post('creator/contents/:id/episodes')
  @Auth('CREATOR', 'ADMIN')
  @ApiOperation({ summary: 'افزودن اپیزود' })
  async addEpisode(
    @CurrentUser('id') userId: string,
    @Param('id') contentId: string,
    @Body() dto: CreateEpisodeDto,
  ) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Creator profile required');
    return successResponse(await this.contentService.addEpisode(contentId, profile.id, dto));
  }

  @Post('creator/contents/:id/publish')
  @Auth('CREATOR', 'ADMIN')
  @ApiOperation({ summary: 'انتشار محتوا' })
  async publish(@CurrentUser('id') userId: string, @Param('id') contentId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Creator profile required');
    return successResponse(await this.contentService.publishContent(contentId, profile.id));
  }

  @Get('creator/contents')
  @Auth('CREATOR', 'ADMIN')
  @ApiOperation({ summary: 'لیست محتوای سازنده' })
  async creatorContents(@CurrentUser('id') userId: string) {
    return successResponse(await this.contentService.getCreatorContents(userId));
  }

  @Get('creator/contents/:id')
  @Auth('CREATOR', 'ADMIN')
  @ApiOperation({ summary: 'جزئیات محتوای سازنده (شامل اپیزودها)' })
  async creatorContentDetail(@CurrentUser('id') userId: string, @Param('id') contentId: string) {
    return successResponse(await this.contentService.getCreatorContentDetail(contentId, userId));
  }

  @Post('creator/media/upload-url')
  @Auth('CREATOR', 'ADMIN')
  @ApiOperation({ summary: 'دریافت URL آپلود مستقیم به MinIO' })
  async creatorUploadUrl(@CurrentUser('id') userId: string, @Body() dto: CreatorUploadUrlDto) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Creator profile required');
    return successResponse(
      await this.storageService.createUploadUrl(profile.id, dto.fileName, dto.contentType),
    );
  }

  @Post('creator/media/upload')
  @Auth('CREATOR', 'ADMIN')
  @ApiOperation({ summary: 'آپلود فایل رسانه از طریق API' })
  @UseInterceptors(FileInterceptor('file'))
  async creatorUpload(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: UploadedMediaFile | undefined,
  ) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) throw new BadRequestException('Creator profile required');
    if (!file) throw new BadRequestException('فایل الزامی است');

    const mediaKey = this.storageService.buildMediaKey(profile.id, file.originalname);
    const result = await this.storageService.uploadObject(
      mediaKey,
      file.buffer,
      file.mimetype || 'application/octet-stream',
    );
    return successResponse(result);
  }
}
