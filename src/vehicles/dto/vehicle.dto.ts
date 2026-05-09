import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleOwnership, VehicleStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @ApiProperty({ example: 'CFM-1042', description: 'Unique vehicle plate or internal reference.' })
  @IsString()
  plateNumber: string;

  @ApiPropertyOptional({ example: 'LCELV1Z42P6001042' })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiProperty({ example: 'Quad', description: 'Vehicle type. Can be Quad, Buggy, Jeep, etc.' })
  @IsString()
  vehicleType: string;

  @ApiPropertyOptional({ enum: VehicleOwnership, example: VehicleOwnership.INTERNAL })
  @IsOptional()
  @IsEnum(VehicleOwnership)
  ownership?: VehicleOwnership;

  @ApiPropertyOptional({ example: 'Vallé Internal Fleet' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional({ example: 'Adventure Client Ltd' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Kevin Delivery' })
  @IsOptional()
  @IsString()
  deliveryPersonName?: string;

  @ApiPropertyOptional({ example: '+230 5123 4567' })
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @ApiPropertyOptional({ example: 'client@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'CFMOTO' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ enum: VehicleStatus, example: VehicleStatus.BUILD_IN_PROGRESS })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({ example: 1180 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  currentHourMeter?: number;

  @ApiPropertyOptional({ example: '2026-05-09T10:00:00.000Z' })
  @IsOptional()
  @IsString()
  checkInDateTime?: string;

  @ApiPropertyOptional({ example: '2026-05-20T10:00:00.000Z' })
  @IsOptional()
  @IsString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ example: 'Brake issue reported after morning trail.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'transaction-uuid-if-linked' })
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class UpdateVehicleDto extends CreateVehicleDto {}
