import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { DepartmentModule } from './department/department.module';
import { HealthModule } from './health/health.module';
import { OrganizationModule } from './organization/organization.module';
import { PrismaModule } from './prisma/prisma.module';
import { RbacModule } from './rbac/rbac.module';
import { UserModule } from './user/user.module';
import { InventoryModule } from './inventory/inventory.module';
import { CrmModule } from './crm/crm.module';
import { SalesModule } from './sales/sales.module';
import { HrmModule } from './hrm/hrm.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds window
        limit: 120, // 120 requests per minute
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    OrganizationModule,
    RbacModule,
    DepartmentModule,
    UserModule,
    InventoryModule,
    CrmModule,
    SalesModule,
    HrmModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
