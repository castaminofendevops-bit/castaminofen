import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Public()
  @Get()
  async check() {
    let db = 'ok';
    let cache = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = 'error';
    }

    try {
      await this.redis.getClient().ping();
    } catch {
      cache = 'degraded';
    }

    return {
      status: db === 'ok' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: { database: db, cache },
    };
  }
}
