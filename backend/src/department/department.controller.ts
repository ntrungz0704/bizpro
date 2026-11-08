import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @RequirePermissions('departments.read')
  async getDepartments(@Req() req: Request) {
    const user = (req as any).user;
    return this.departmentService.getDepartments(user?.organizationId);
  }

  @Post()
  @RequirePermissions('departments.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createDepartment(@Body() dto: CreateDepartmentDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.departmentService.createDepartment(user?.organizationId, dto);
  }

  @Patch(':id')
  @RequirePermissions('departments.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.departmentService.updateDepartment(user?.organizationId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('departments.manage')
  async deleteDepartment(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.departmentService.deleteDepartment(user?.organizationId, id);
  }
}
