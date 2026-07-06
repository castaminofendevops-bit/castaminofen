import { Test } from '@nestjs/testing';
import { RssFeedService } from './rss-feed.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

const mockPrisma = {
  content: {
    findFirst: jest.fn().mockResolvedValue({
      slug: 'test-podcast',
      sourceFeedUrl: 'https://example.com/feed.xml',
      title: 'Test Podcast',
      description: 'Test description',
      language: 'fa',
      coverUrl: 'https://example.com/image.jpg',
      creator: { user: { displayName: 'Owner', email: 'owner@example.com' } },
      tags: [{ tag: { name: 'tag1' } }],
      episodes: [
        {
          id: 'ep1',
          title: 'Episode 1',
          description: 'Description',
          mediaUrl: 'https://example.com/episode1.mp3',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          episodeNumber: 1,
          duration: 123,
          publishedAt: new Date('2025-01-01T10:00:00Z'),
          rssGuid: 'guid1',
        },
      ],
    }),
  },
};

const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
};

describe('RssFeedService', () => {
  let service: RssFeedService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RssFeedService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();
    service = moduleRef.get<RssFeedService>(RssFeedService);
  });

  it('should generate RSS XML for a published podcast', async () => {
    const xml = await service.getFeedXml('test-podcast');

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<title>Test Podcast</title>');
    expect(xml).toContain('<enclosure url="https://example.com/episode1.mp3"');
    expect(xml).toContain('<itunes:duration>2:03</itunes:duration>');
  });
});
