import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SalesOrderStatus } from '@prisma/client';

export class CreateSalesOrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0.001, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;

  @IsNumber()
  @Min(0, { message: 'Đơn giá không được âm' })
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;
}

export class CreateSalesOrderDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  warehouseId: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;

  @IsOptional()
  @IsString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  shippingRecipientName?: string;

  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  shippingProvinceCode?: string;

  @IsOptional()
  @IsString()
  shippingDistrictCode?: string;

  @IsOptional()
  @IsString()
  shippingWardCode?: string;

  @IsOptional()
  @IsString()
  shippingFullAddress?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 sản phẩm' })
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderItemDto)
  items: CreateSalesOrderItemDto[];
}

export class UpdateSalesOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;

  @IsOptional()
  @IsString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  shippingRecipientName?: string;

  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  shippingProvinceCode?: string;

  @IsOptional()
  @IsString()
  shippingDistrictCode?: string;

  @IsOptional()
  @IsString()
  shippingWardCode?: string;

  @IsOptional()
  @IsString()
  shippingFullAddress?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderItemDto)
  items?: CreateSalesOrderItemDto[];
}

export class ConfirmSalesOrderDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelSalesOrderDto {
  @IsString()
  reason: string;
}

export class WarehouseAckCancelDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class FulfillmentItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0.001, { message: 'Số lượng xuất phải lớn hơn 0' })
  quantity: number;
}

export class FulfillSalesOrderDto {
  @IsOptional()
  @IsString()
  carrierName?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FulfillmentItemDto)
  items?: FulfillmentItemDto[];
}

export class QuerySalesOrderDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SalesOrderStatus)
  status?: SalesOrderStatus;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
