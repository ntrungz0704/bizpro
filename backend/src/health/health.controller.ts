import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckError,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe - checks if the application process is running' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  @HealthCheck()
  checkLive() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
      async () => ({
        process: {
          status: 'up',
          uptime: Math.floor(process.uptime()),
          nodeVersion: process.version,
        },
      }),
    ]);
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe - actively checks PostgreSQL database connection',
  })
  @ApiResponse({ status: 200, description: 'Application and Database are ready' })
  @ApiResponse({ status: 503, description: 'Database is not reachable' })
  @HealthCheck()
  checkReady() {
    return this.health.check([
      async () => {
        const dbHealth = await this.prisma.isHealthy();
        if (!dbHealth.status) {
          throw new HealthCheckError('Database health check failed', {
            database: {
              status: 'down',
              error: dbHealth.error,
              latencyMs: dbHealth.latencyMs,
            },
          });
        }
        return {
          database: {
            status: 'up',
            latencyMs: dbHealth.latencyMs,
          },
          system: {
            status: 'up',
            ready: true,
            phase: '1C - Database Foundation',
          },
        };
      },
    ]);
  }
}
