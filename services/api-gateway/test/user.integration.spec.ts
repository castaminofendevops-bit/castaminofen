import { INestApplication, ExecutionContext, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { UserController } from '../src/modules/user/user.controller';
import { UserService } from '../src/modules/user/user.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { RolesGuard } from '../src/common/guards/roles.guard';

const TEST_USER_ID = 'user-test';

const mockPrisma = {
  content: { findUnique: jest.fn() },
  libraryItem: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: TEST_USER_ID, role: 'USER' };
    return true;
  },
};

describe('User library (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, { provide: PrismaService, useValue: mockPrisma }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /user/library/:contentId adds content', async () => {
    mockPrisma.content.findUnique.mockResolvedValue({ id: 'c1' });
    mockPrisma.libraryItem.create.mockResolvedValue({ userId: TEST_USER_ID, contentId: 'c1' });

    const res = await request(app.getHttpServer()).post('/user/library/c1');

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.libraryItem.create).toHaveBeenCalledWith({
      data: { userId: TEST_USER_ID, contentId: 'c1' },
    });
  });

  it('DELETE /user/library/:contentId removes content', async () => {
    mockPrisma.libraryItem.deleteMany.mockResolvedValue({ count: 1 });

    const res = await request(app.getHttpServer()).delete('/user/library/c1').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.removed).toBe(true);
    expect(mockPrisma.libraryItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID, contentId: 'c1' },
    });
  });

  it('DELETE /user/library/:contentId returns 404 when not in library', async () => {
    mockPrisma.libraryItem.deleteMany.mockResolvedValue({ count: 0 });

    await request(app.getHttpServer()).delete('/user/library/missing').expect(404);
  });
});
