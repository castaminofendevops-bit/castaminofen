import { Body, Controller, Get, Header, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RssImporterService } from './rss-importer.service';
import { RssFeedService } from './rss-feed.service';
import { ImportRssDto, FeedQueryDto } from './rss.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { successResponse, errorResponse } from '../../common/utils/response.util';

@ApiTags('RSS')
@Controller()
export class RssController {
  constructor(
    private readonly rssImporter: RssImporterService,
    private readonly rssFeedService: RssFeedService,
  ) {}

  @Post('creator/import-rss')
  @Auth('ADMIN')
  @ApiOperation({ summary: 'Import RSS feeds for creator podcasts' })
  @ApiBody({ type: ImportRssDto })
  async importRss(@Body() payload: ImportRssDto) {
    try {
      const result = await this.rssImporter.importFeeds(payload);
      return successResponse(result);
    } catch (error) {
      return errorResponse('RSS_IMPORT_FAILED', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  @Get('channel/:slug/feed')
  @ApiOperation({ summary: 'Generate RSS feed XML for a podcast channel' })
  @ApiParam({ name: 'slug', description: 'Podcast channel slug' })
  @ApiQuery({ name: 'ttl', required: false, type: Number, description: 'Cache TTL in seconds' })
  @Header('Content-Type', 'application/rss+xml; charset=UTF-8')
  async getChannelFeed(@Param('slug') slug: string, @Query() query: FeedQueryDto) {
    try {
      return await this.rssFeedService.getFeedXml(slug, query.ttl);
    } catch (error) {
      return errorResponse('RSS_FEED_NOT_FOUND', error instanceof Error ? error.message : 'Channel not found');
    }
  }
}
