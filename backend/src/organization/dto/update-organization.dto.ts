import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateOrganizationDto {
  @IsNotEmpty({ message: 'Tên doanh nghiệp / Công ty không được để trống.' })
  @IsString({ message: 'Tên doanh nghiệp phải là chuỗi ký tự.' })
  @MaxLength(255, { message: 'Tên doanh nghiệp tối đa 255 ký tự.' })
  name: string;

  @IsNotEmpty({ message: 'Mã tổ chức không được để trống.' })
  @IsString({ message: 'Mã tổ chức phải là chuỗi ký tự.' })
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Mã tổ chức chỉ chấp nhận chữ hoa, chữ số, gạch ngang (-) và gạch dưới (_).',
  })
  code: string;

  @IsNotEmpty({ message: 'Mã số thuế không được để trống.' })
  @Matches(/^(\d{10}|\d{13}|\d{10}-\d{3})$/, {
    message: 'Mã số thuế không hợp lệ. Chỉ chấp nhận 10 chữ số hoặc 13 chữ số (ví dụ: 0109988776 hoặc 0109988776-001).',
  })
  taxCode: string;

  @IsNotEmpty({ message: 'Email liên hệ không được để trống.' })
  @IsEmail({}, { message: 'Email liên hệ chính thức không đúng định dạng.' })
  email: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
  @Matches(/^(\+84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9\d|2\d{1,2})[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/, {
    message: 'Số điện thoại không đúng định dạng Việt Nam (+84 hoặc 0, gồm 10 hoặc 11 số).',
  })
  phone: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự.' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Website phải là chuỗi ký tự.' })
  website?: string;

  @IsOptional()
  @IsIn(['VND', 'USD', 'EUR'], { message: 'Đơn vị tiền tệ chỉ chấp nhận VND, USD hoặc EUR.' })
  currency?: string;

  @IsOptional()
  @IsString({ message: 'Múi giờ phải là chuỗi ký tự.' })
  timezone?: string;
}
