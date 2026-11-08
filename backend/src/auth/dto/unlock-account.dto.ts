import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class UnlockAccountDto {
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  email: string;

  @IsNotEmpty({ message: 'Mã OTP không được để trống.' })
  @Length(6, 6, { message: 'Mã OTP phải gồm đúng 6 chữ số.' })
  @Matches(/^\d{6}$/, { message: 'Mã OTP chỉ bao gồm các chữ số.' })
  otpCode: string;
}
