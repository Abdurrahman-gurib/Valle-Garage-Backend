import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.VEHICLE_ORDER })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({ enum: TransactionStatus, example: TransactionStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ example: 'Customer Order - New Quad Build' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'CFMOTO Supplier' })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({ example: 'supplier@example.com' })
  @IsOptional()
  @IsString()
  supplierEmail?: string;

  @ApiPropertyOptional({ example: 'External Adventure Client' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: '2026-05-09T10:00:00.000Z' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-09T10:00:00.000Z' })
  @IsOptional()
  @IsString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ example: 'PO-0001' })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiPropertyOptional({ example: 'po-file.pdf' })
  @IsOptional()
  @IsString()
  poAttachmentUrl?: string;

  @ApiPropertyOptional({ example: 'invoice-file.pdf' })
  @IsOptional()
  @IsString()
  invoiceAttachmentUrl?: string;

  @ApiPropertyOptional({ example: 'grn-file.pdf' })
  @IsOptional()
  @IsString()
  grnAttachmentUrl?: string;

  @ApiPropertyOptional({ example: { receivedBy: 'Store Keeper', items: [{ name: 'Brake Pad Set', qty: 2 }] } })
  @IsOptional()
  @IsObject()
  grnData?: any;

  @ApiPropertyOptional({ example: 250000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ example: 'Customer order based on uploaded PO.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTransactionDto extends CreateTransactionDto {}

export class CompleteWithGrnDto {
  @ApiProperty({ example: { receivedBy: 'Store Keeper', checkedBy: 'Admin', notes: 'All items received.' } })
  @IsObject()
  grnData: any;

  @ApiPropertyOptional({ example: 'grn-TXN-0001.pdf' })
  @IsOptional()
  @IsString()
  grnAttachmentUrl?: string;
}
