import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma Client connected to PostgreSQL database successfully.');
    } catch (error) {
      this.logger.error(
        'Failed to connect to PostgreSQL database during initialization',
        error instanceof Error ? error.stack : error,
      );
      // We do not crash the process immediately in development so health check can report down status
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma Client disconnected.');
  }

  /**
   * Performs an active ping to PostgreSQL to verify actual connectivity.
   */
  async isHealthy(): Promise<{ status: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: true, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: false,
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  /**
   * Executes an interactive transaction strictly bound to a tenant context with Fail-Closed RLS.
   * Uses tx.$queryRaw with is_local=true so the setting is strictly transaction-scoped
   * and never leaks to connection pools.
   */
  async runInTenantContext<T>(
    organizationId: string,
    fn: (tx: import('@prisma/client').Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT set_config('app.current_organization_id', ${organizationId}::text, true);`;
      return fn(tx);
    });
  }

  /**
   * Executes an interactive transaction in system context (e.g. login credentials lookup,
   * account unlock lookup, or system bootstrapping).
   * Sets app.is_system_context = 'true' with is_local=true strictly within the transaction boundary.
   */
  async runInSystemContext<T>(
    fn: (tx: import('@prisma/client').Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT set_config('app.is_system_context', 'true', true);`;
      return fn(tx);
    });
  }
}
