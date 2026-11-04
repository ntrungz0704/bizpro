import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe - checks if the application process is running' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  @HealthCheck()
  checkLive() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
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
    summary: 'Readiness probe - checks if the application is ready to accept traffic',
  })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @HealthCheck()
  checkReady() {
    return this.health.check([
      // In Phase 1C, Prisma database connection check will be attached here
      async () => ({
        system: {
          status: 'up',
          ready: true,
          phase: '1B - Backend Foundation',
        },
      }),
    ]);
  }
}
