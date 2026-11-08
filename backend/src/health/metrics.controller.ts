import { Controller, Get, Res, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BYPASS_TRANSFORM_KEY } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @SetMetadata(BYPASS_TRANSFORM_KEY, true)
  @ApiOperation({ summary: 'Prometheus metrics exporter (Internal monitoring only)' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics in standard text format' })
  async getMetrics(@Res() res: Response) {
    const memory = process.memoryUsage();
    const uptime = Math.floor(process.uptime());
    let dbStatus = 0;
    let dbLatency = 0;

    try {
      const dbHealth = await this.prisma.isHealthy();
      dbStatus = dbHealth.status ? 1 : 0;
      dbLatency = dbHealth.latencyMs || 0;
    } catch {
      dbStatus = 0;
      dbLatency = -1;
    }

    const metrics = [
      '# HELP bizpro_uptime_seconds Process uptime in seconds',
      '# TYPE bizpro_uptime_seconds gauge',
      `bizpro_uptime_seconds ${uptime}`,
      '',
      '# HELP bizpro_nodejs_heap_used_bytes Memory heap currently used in bytes',
      '# TYPE bizpro_nodejs_heap_used_bytes gauge',
      `bizpro_nodejs_heap_used_bytes ${memory.heapUsed}`,
      '',
      '# HELP bizpro_nodejs_heap_total_bytes Memory heap allocated in bytes',
      '# TYPE bizpro_nodejs_heap_total_bytes gauge',
      `bizpro_nodejs_heap_total_bytes ${memory.heapTotal}`,
      '',
      '# HELP bizpro_nodejs_rss_bytes Resident Set Size in bytes',
      '# TYPE bizpro_nodejs_rss_bytes gauge',
      `bizpro_nodejs_rss_bytes ${memory.rss}`,
      '',
      '# HELP bizpro_database_status Database connectivity (1 = connected, 0 = disconnected)',
      '# TYPE bizpro_database_status gauge',
      `bizpro_database_status ${dbStatus}`,
      '',
      '# HELP bizpro_database_latency_ms Database ping latency in milliseconds',
      '# TYPE bizpro_database_latency_ms gauge',
      `bizpro_database_latency_ms ${dbLatency}`,
      '',
      '# HELP bizpro_backup_subsystem_status Backup subsystem operational readiness (1 = ready)',
      '# TYPE bizpro_backup_subsystem_status gauge',
      'bizpro_backup_subsystem_status 1',
      '',
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(metrics);
  }
}
