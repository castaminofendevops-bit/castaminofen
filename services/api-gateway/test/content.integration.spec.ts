import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ContentController } from '../src/modules/content/content.controller';
import { ContentService } from '../src/modules/content/content.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { RedisService } from '../src/common/redis/redis.service';
import { StorageService } from '../src/common/storage/storage.service';
import { mockPrisma, mockRedis, mockStorage } from './helpers/create-test-app';

describe('Content (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        ContentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /explore returns paginated published content', async () => {
    mockPrisma.content.findMany.mockResolvedValue([
      {
        id: 'c1',
        type: 'PODCAST',
        title: 'پادکست تست',
        slug: 'podcast-test',
        coverUrl: null,
        isPremium: false,
        creator: {
          id: 'cr1',
          slug: 'creator',
          isVerified: true,
          user: { displayName: 'سازنده', avatarUrl: null },
        },
        _count: { episodes: 3 },
      },
    ]);
    mockPrisma.content.count.mockResolvedValue(1);

    const res = await request(app.getHttpServer()).get('/explore').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('پادکست تست');
    expect(res.body.meta).toEqual(expect.objectContaining({ total: 1, page: 1 }));
  });

  it('GET /search returns grouped results', async () => {
    mockPrisma.content.findMany.mockResolvedValue([]);
    mockPrisma.episode.findMany.mockResolvedValue([]);
    mockPrisma.creatorProfile.findMany.mockResolvedValue([]);

    const res = await request(app.getHttpServer()).get('/search?q=تست').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(
      expect.objectContaining({
        contents: expect.any(Array),
        episodes: expect.any(Array),
        creators: expect.any(Array),
      }),
    );
  });

  it('GET /search rejects missing query param', async () => {
    await request(app.getHttpServer()).get('/search').expect(400);
  });

  it('GET /trending returns popular content list', async () => {
    mockPrisma.content.findMany.mockResolvedValue([
      {
        id: 'c2',
        type: 'PODCAST',
        title: 'ترند',
        slug: 'trend',
        coverUrl: null,
        isPremium: false,
        creator: {
          id: 'cr1',
          slug: 'creator',
          isVerified: true,
          user: { displayName: 'سازنده', avatarUrl: null },
        },
        _count: { episodes: 10 },
      },
    ]);

    const res = await request(app.getHttpServer()).get('/trending').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data[0].title).toBe('ترند');
  });

  it('GET /contents/:id/related returns related items', async () => {
    mockPrisma.content.findFirst.mockResolvedValue({ id: 'c1', type: 'PODCAST', creatorId: 'cr1' });
    mockPrisma.content.findMany.mockResolvedValue([
      {
        id: 'c3',
        type: 'PODCAST',
        title: 'مرتبط',
        slug: 'related',
        coverUrl: null,
        isPremium: false,
        creator: {
          id: 'cr2',
          slug: 'creator2',
          isVerified: false,
          user: { displayName: 'سازنده ۲', avatarUrl: null },
        },
        _count: { episodes: 2 },
      },
    ]);

    const res = await request(app.getHttpServer()).get('/contents/c1/related').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data[0].title).toBe('مرتبط');
  });
});
