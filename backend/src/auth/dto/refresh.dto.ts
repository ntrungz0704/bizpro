import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @IsString({ message: 'Refresh token phải là chuỗi ký tự' })
  @IsOptional()
  refreshToken?: string;
}

export { RefreshDto as RefreshTokenDto };
