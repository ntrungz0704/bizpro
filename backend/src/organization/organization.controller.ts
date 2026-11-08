import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@Controller('organization')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('current')
  @RequirePermissions('organization.read')
  async getCurrent(@Req() req: Request) {
    const user = (req as any).user;
    return this.organizationService.getCurrent(user?.organizationId);
  }

  @Patch('current')
  @RequirePermissions('organization.update')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateCurrent(@Body() dto: UpdateOrganizationDto, @Req() req: Request) {
    const user = (req as any).user;
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'BizPro WebApp';
    return this.organizationService.updateCurrent(
      dto,
      user?.organizationId,
      user?.sub || user?.id,
      ipAddress,
      userAgent,
    );
  }

  @Post('reset')
  @RequirePermissions('settings.manage')
  @HttpCode(HttpStatus.OK)
  async resetCurrent(@Req() req: Request) {
    const user = (req as any).user;
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'BizPro WebApp';
    return this.organizationService.resetCurrent(
      user?.organizationId,
      user?.sub || user?.id,
      ipAddress,
      userAgent,
    );
  }

  @Get('audit-logs')
  @RequirePermissions('audit_logs.read')
  async getAuditLogs(@Req() req: Request) {
    const user = (req as any).user;
    return this.organizationService.getAuditLogs(user?.organizationId);
  }
}
