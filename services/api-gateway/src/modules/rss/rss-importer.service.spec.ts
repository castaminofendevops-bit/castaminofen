import { RssImporterService } from './rss-importer.service';

describe('RssImporterService (mirrorMedia)', () => {
  let importer: RssImporterService;
  const mockPrisma: any = {};
  const mockStorage: any = {};
  const mockParser: any = {};
  const mockFeedService: any = {};

  beforeEach(() => {
    // basic mocks
    mockPrisma.user = { findUnique: jest.fn(), create: jest.fn() };
    mockPrisma.creatorProfile = { findUnique: jest.fn(), create: jest.fn() };
    mockPrisma.content = { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() };
    mockPrisma.episode = { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() };

    mockStorage.buildMediaKey = jest.fn().mockReturnValue('media/key.mp3');
    mockStorage.uploadObject = jest.fn().mockResolvedValue({ mediaUrl: 'https://cdn.example/media/key.mp3', mediaKey: 'media/key.mp3' });

    mockParser.normalizeFeedUrl = jest.fn((u: string) => u);
    mockParser.parseFeed = jest.fn().mockReturnValue({
      title: 'Test Podcast',
      description: 'desc',
      language: 'fa',
      image: 'https://example.com/cover.jpg',
      ownerEmail: 'owner@example.com',
      episodes: [
        {
          title: 'Ep 1',
          guid: 'guid-1',
          audioUrl: 'https://media.example/ep1.mp3',
          enclosureType: 'audio/mpeg',
          publishDate: new Date().toISOString(),
          duration: '00:10:00',
          episodeNumber: 1,
        },
      ],
    });

    mockFeedService.invalidateCache = jest.fn();

    // global fetch mock that returns text for feed URL and arrayBuffer for media URL
    global.fetch = jest.fn((url: string) => {
      if (url.endsWith('.xml')) {
        return Promise.resolve({ ok: true, text: async () => '<rss></rss>' });
      }
      // media
      return Promise.resolve({ ok: true, arrayBuffer: async () => Buffer.from('audio-bytes') });
    }) as any;

    importer = new RssImporterService(mockPrisma, mockStorage, mockParser, mockFeedService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    // @ts-ignore
    delete global.fetch;
  });

  it('uploads media and stores uploaded mediaUrl when mirrorMedia is true', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'user-1', email: 'owner@example.com' });
    mockPrisma.creatorProfile.create.mockResolvedValue({ id: 'creator-1', userId: 'user-1', slug: 'test-podcast-1' });
    mockPrisma.content.findFirst.mockResolvedValue(null);
    mockPrisma.content.create.mockResolvedValue({ id: 'content-1', slug: 'test-podcast' });
    mockPrisma.episode.findFirst.mockResolvedValue(null);
    mockPrisma.episode.create.mockResolvedValue({ id: 'ep-1' });

    const result = await importer.importFeeds({ feeds: ['https://example.com/feed.xml'], mirrorMedia: true, dryRun: false });

    expect(mockStorage.uploadObject).toHaveBeenCalled();
    // ensure episode created with mediaUrl from upload
    expect(mockPrisma.episode.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ mediaUrl: 'https://cdn.example/media/key.mp3' }) }));
    expect(result.feeds[0].episodesCreated).toBe(1);
    expect(result.feeds[0].status).toBe('imported');
  });
});
import { Test } from '@nestjs/testing';
import { RssImporterService } from './rss-importer.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { RssParserService } from './rss-parser.service';

const mockPrisma: any = {
  user: { findUnique: jest.fn(), create: jest.fn() },
  creatorProfile: { findUnique: jest.fn(), create: jest.fn() },
  content: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  episode: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
};

const mockStorage: any = { createUploadUrl: jest.fn(), buildMediaKey: jest.fn(), uploadObject: jest.fn() };

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
