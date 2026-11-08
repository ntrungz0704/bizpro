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

@Controller('rbac')
@UseGuards(JwtAuthGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  async getRoles(@Req() req: Request) {
    const user = (req as any).user;
    return this.rbacService.getRoles(user?.organizationId);
  }

  @Post('roles')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createRole(@Body() dto: CreateRoleDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.rbacService.createRole(user?.organizationId, dto);
  }

  @Patch('roles/:id')
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
  async getPermissions() {
    return this.rbacService.getPermissions();
  }

  @Put('roles/:id/permissions')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateRolePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rbacService.updateRolePermissions(id, dto.permissionIds);
  }

  @Post('users/:id/roles')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async assignUserRoles(
    @Param('id') id: string,
    @Body() dto: AssignUserRolesDto,
  ) {
    return this.rbacService.assignUserRoles(id, dto.roleIds);
  }
}
