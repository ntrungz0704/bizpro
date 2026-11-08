import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Req() req: Request) {
    const user = (req as any).user;
    return this.userService.getUsers(user?.organizationId);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createUser(@Body() dto: CreateUserDto, @Req() req: Request) {
    const user = (req as any).user;
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'BizPro WebApp';
    return this.userService.createUser(
      user?.organizationId,
      dto,
      user?.id,
      ipAddress,
      userAgent,
    );
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'BizPro WebApp';
    return this.userService.updateUser(
      id,
      dto,
      user?.id,
      ipAddress,
      userAgent,
    );
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'BizPro WebApp';
    return this.userService.updateUserStatus(
      id,
      dto,
      user?.id,
      ipAddress,
      userAgent,
    );
  }
}
