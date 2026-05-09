import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'CF-BRK-110', description: 'Unique part SKU.' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Brake Pad Set', description: 'Part name.' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Brake System' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '889100110' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: 34 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  currentStock?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reorderLevel?: number;

  @ApiPropertyOptional({ example: 850.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  costPrice?: number;

  @ApiPropertyOptional({ example: 1250.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sellingPrice?: number;

  @ApiPropertyOptional({ example: 'CFMOTO Supplier' })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({ example: 'supplier@example.com' })
  @IsOptional()
  @IsString()
  supplierEmail?: string;

  @ApiPropertyOptional({ example: 'Workshop Shelf A' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateInventoryItemDto extends CreateInventoryItemDto {}
