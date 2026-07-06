import { Module } from '@nestjs/common';
import { RssController } from './rss.controller';
import { RssParserService } from './rss-parser.service';
import { RssImporterService } from './rss-importer.service';
import { RssFeedService } from './rss-feed.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [PrismaModule, RedisModule, StorageModule],
  controllers: [RssController],
  providers: [RssParserService, RssImporterService, RssFeedService],
  exports: [RssImporterService, RssFeedService],
})
export class RssModule {}
