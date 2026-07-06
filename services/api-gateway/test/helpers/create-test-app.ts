import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { API_PREFIX } from '@castaminofen/shared';

export async function createTestApp(moduleMetadata: Parameters<typeof Test.createTestingModule>[0]): Promise<{
  app: INestApplication;
  module: TestingModule;
}> {
  const module = await Test.createTestingModule(moduleMetadata).compile();
  const app = module.createNestApplication();
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return { app, module };
}

export const mockPrisma = {
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  content: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
  },
  episode: {
    findMany: jest.fn(),
  },
  creatorProfile: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

export const mockRedis = {
  getClient: jest.fn().mockReturnValue({
    ping: jest.fn().mockResolvedValue('PONG'),
  }),
};

export const mockStorage = {
  createUploadUrl: jest.fn(),
  buildMediaKey: jest.fn(),
  uploadObject: jest.fn(),
};
