import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AssignUserRolesDto,
  CreateRoleDto,
  UpdateRoleDto,
  UpdateRolePermissionsDto,
} from './dto/rbac.dto';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermissions } from './decorators/permissions.decorator';

@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @RequirePermissions('rbac.roles.read')
  async getRoles(@Req() req: Request) {
    const user = (req as any).user;
    return this.rbacService.getRoles(user?.organizationId);
  }

  @Post('roles')
  @RequirePermissions('rbac.roles.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createRole(@Body() dto: CreateRoleDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.rbacService.createRole(user?.organizationId, dto);
  }

  @Patch('roles/:id')
  @RequirePermissions('rbac.roles.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.rbacService.updateRole(user?.organizationId, id, dto);
  }

  @Get('permissions')
  @RequirePermissions('rbac.roles.read')
  async getPermissions() {
    return this.rbacService.getPermissions();
  }

  @Put('roles/:id/permissions')
  @RequirePermissions('rbac.roles.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateRolePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.rbacService.updateRolePermissions(user?.organizationId, id, dto.permissionIds);
  }

  @Post('users/:id/roles')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('rbac.roles.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async assignUserRoles(
    @Param('id') id: string,
    @Body() dto: AssignUserRolesDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.rbacService.assignUserRoles(user?.organizationId, id, dto.roleIds);
  }
}
