import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { HealthController } from '../src/modules/health/health.controller';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { RedisService } from '../src/common/redis/redis.service';
import { mockPrisma, mockRedis } from './helpers/create-test-app';

describe('Health (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('/api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns healthy when db and cache ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(res.body.status).toBe('healthy');
    expect(res.body.services.database).toBe('ok');
    expect(res.body.services.cache).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/health returns unhealthy when db fails', async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('db down'));

    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(res.body.status).toBe('unhealthy');
    expect(res.body.services.database).toBe('error');
  });
});
