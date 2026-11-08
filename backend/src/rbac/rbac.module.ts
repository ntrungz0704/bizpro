import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsGuard } from './guards/permissions.guard';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [RbacController],
  providers: [RbacService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard],
})
export class RbacModule {}
