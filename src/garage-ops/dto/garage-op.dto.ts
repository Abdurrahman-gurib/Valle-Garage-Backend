import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GarageProcessType, GarageStatus } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGarageOperationDto {
  @ApiProperty({ example: 'vehicle-uuid' })
  @IsString()
  vehicleId: string;

  @ApiPropertyOptional({ example: 'assessment-uuid' })
  @IsOptional()
  @IsString()
  assessmentId?: string;

  @ApiProperty({ enum: GarageProcessType, example: GarageProcessType.REPAIR })
  @IsEnum(GarageProcessType)
  processType: GarageProcessType;

  @ApiPropertyOptional({ enum: GarageStatus, example: GarageStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(GarageStatus)
  status?: GarageStatus;

  @ApiPropertyOptional({ example: 'Brake pads replaced and fluid checked.' })
  @IsOptional()
  @IsString()
  proceduresPerformed?: string;

  @ApiPropertyOptional({ example: [{ partName: 'Brake Pad Set', quantity: 2 }] })
  @IsOptional()
  @IsArray()
  partsUsed?: any[];

  @ApiPropertyOptional({ example: 'mechanic-user-uuid' })
  @IsOptional()
  @IsString()
  mechanicId?: string;

  @ApiPropertyOptional({ example: '2026-05-09T08:00:00.000Z' })
  @IsOptional()
  @IsString()
  checkInDateTime?: string;

  @ApiPropertyOptional({ example: '2026-05-09T09:00:00.000Z' })
  @IsOptional()
  @IsString()
  startDateTime?: string;

  @ApiPropertyOptional({ example: '2026-05-09T12:00:00.000Z' })
  @IsOptional()
  @IsString()
  endDateTime?: string;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  laborHours?: number;

  @ApiPropertyOptional({ example: 1180 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentHourMeter?: number;

  @ApiPropertyOptional({ example: 1250 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nextServiceDueAtHours?: number;

  @ApiPropertyOptional({ example: 'invoice-PRC-501.pdf' })
  @IsOptional()
  @IsString()
  invoiceAttachmentUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  paymentDone?: boolean;

  @ApiPropertyOptional({ example: ['photo-url-1.jpg'] })
  @IsOptional()
  @IsArray()
  photos?: any[];
}

export class UpdateGarageOperationDto extends CreateGarageOperationDto {}
