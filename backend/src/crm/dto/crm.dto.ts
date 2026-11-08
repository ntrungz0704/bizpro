import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityStatus, ActivityType, CommonStatus, CustomerType, DealStatus, LeadStatus } from '@prisma/client';

export const VN_PHONE_REGEX = /^(\+84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9\d|2\d{1,2})[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/;
export const VN_TAX_CODE_REGEX = /^(\d{10}|\d{13}|\d{10}-\d{3})$/;

/* --------------------------------------------------------------------------
   LEADS DTOs
   -------------------------------------------------------------------------- */
export class CreateLeadDto {
  @IsNotEmpty({ message: 'Tên người liên hệ không được để trống.' })
  @IsString()
  @MaxLength(255)
  contactName: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email?: string;

  @IsOptional()
  @Matches(VN_PHONE_REGEX, {
    message: 'Số điện thoại không đúng định dạng Việt Nam (+84 hoặc 0, 10-11 số).',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email?: string;

  @IsOptional()
  @Matches(VN_PHONE_REGEX, {
    message: 'Số điện thoại không đúng định dạng Việt Nam (+84 hoặc 0, 10-11 số).',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class ConvertLeadDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  dealTitle?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dealAmount?: number;

  @IsOptional()
  @IsString()
  pipelineId?: string;

  @IsOptional()
  @IsString()
  stageId?: string;

  @IsOptional()
  @IsString()
  expectedCloseDate?: string;
}

/* --------------------------------------------------------------------------
   CUSTOMERS DTOs
   -------------------------------------------------------------------------- */
export class CreateCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customerCode?: string;

  @IsNotEmpty({ message: 'Tên khách hàng không được để trống.' })
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email?: string;

  @IsOptional()
  @Matches(VN_PHONE_REGEX, {
    message: 'Số điện thoại không đúng định dạng Việt Nam (+84 hoặc 0, 10-11 số).',
  })
  phone?: string;

  @IsOptional()
  @Matches(VN_TAX_CODE_REGEX, {
    message: 'Mã số thuế không hợp lệ. Chỉ chấp nhận 10 hoặc 13 chữ số.',
  })
  taxCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(CommonStatus)
  status?: CommonStatus;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email?: string;

  @IsOptional()
  @Matches(VN_PHONE_REGEX, {
    message: 'Số điện thoại không đúng định dạng Việt Nam (+84 hoặc 0, 10-11 số).',
  })
  phone?: string;

  @IsOptional()
  @Matches(VN_TAX_CODE_REGEX, {
    message: 'Mã số thuế không hợp lệ. Chỉ chấp nhận 10 hoặc 13 chữ số.',
  })
  taxCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(CommonStatus)
  status?: CommonStatus;
}

/* --------------------------------------------------------------------------
   CONTACTS DTOs
   -------------------------------------------------------------------------- */
export class CreateContactDto {
  @IsNotEmpty({ message: 'Họ và tên đệm không được để trống.' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsNotEmpty({ message: 'Tên không được để trống.' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email?: string;

  @IsOptional()
  @Matches(VN_PHONE_REGEX, {
    message: 'Số điện thoại không đúng định dạng Việt Nam.',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email?: string;

  @IsOptional()
  @Matches(VN_PHONE_REGEX, {
    message: 'Số điện thoại không đúng định dạng Việt Nam.',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(CommonStatus)
  status?: CommonStatus;
}

/* --------------------------------------------------------------------------
   DEALS DTOs
   -------------------------------------------------------------------------- */
export class CreateDealDto {
  @IsNotEmpty({ message: 'Tên cơ hội kinh doanh không được để trống.' })
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  pipelineId?: string;

  @IsOptional()
  @IsString()
  stageId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;
}

export class UpdateDealDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  stageId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsString()
  lostReason?: string;
}

export class UpdateDealStageDto {
  @IsNotEmpty({ message: 'Mã giai đoạn stageId không được để trống.' })
  @IsString()
  stageId: string;

  @IsOptional()
  @IsString()
  lostReason?: string;
}

/* --------------------------------------------------------------------------
   ACTIVITIES DTOs
   -------------------------------------------------------------------------- */
export class CreateActivityDto {
  @IsNotEmpty()
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsNotEmpty({ message: 'Tiêu đề hoạt động không được để trống.' })
  @IsString()
  @MaxLength(255)
  subject: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  dueAt?: string;

  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @IsNotEmpty()
  @IsString()
  relatedEntityType: string;

  @IsNotEmpty()
  @IsString()
  relatedEntityId: string;

  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;
}

export class UpdateActivityDto {
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  dueAt?: string;

  @IsOptional()
  @IsString()
  completedAt?: string;

  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;
}
