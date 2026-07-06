import { Test } from '@nestjs/testing';
import { RssImporterService } from './rss-importer.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { RssParserService } from './rss-parser.service';

const mockPrisma = {
  user: { findUnique: jest.fn(), create: jest.fn() },
  creatorProfile: { findUnique: jest.fn(), create: jest.fn() },
  content: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  episode: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
};

const mockStorage = { createUploadUrl: jest.fn(), buildMediaKey: jest.fn(), uploadObject: jest.fn() };

describe('RssImporterService', () => {
  let service: RssImporterService;
  let parser: RssParserService;

  beforeEach(async () => {
    parser = new RssParserService();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RssImporterService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
        { provide: RssParserService, useValue: parser },
      ],
    }).compile();

    service = moduleRef.get<RssImporterService>(RssImporterService);
  });

  it('should deduplicate duplicate feed URLs within the same batch', async () => {
    const result = await service.importFeeds({
      feeds: [
        'https://rss.castbox.fm/everest/1f4e2c0cae1740f5bff605527db43b59.xml',
        'http://rss.castbox.fm/everest/1f4e2c0cae1740f5bff605527db43b59.xml',
      ],
      emailMap: {},
      dryRun: true,
    });

    const duplicateErrors = result.feeds.filter((feed) => feed.status === 'error');
    expect(duplicateErrors).toHaveLength(1);
    expect(duplicateErrors[0].error).toBe('Duplicate in same batch');
  });
});
