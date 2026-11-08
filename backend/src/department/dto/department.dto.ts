import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsOptional()
  parentDepartmentId?: string;

  @IsString()
  @IsOptional()
  managerEmployeeId?: string;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsOptional()
  parentDepartmentId?: string;

  @IsString()
  @IsOptional()
  managerEmployeeId?: string;

  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}
