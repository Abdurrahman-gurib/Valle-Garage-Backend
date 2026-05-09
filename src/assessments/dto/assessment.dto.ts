import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssessmentStatus } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAssessmentDto {
  @ApiProperty({ example: 'vehicle-uuid', description: 'Vehicle ID being assessed.' })
  @IsString()
  vehicleId: string;

  @ApiPropertyOptional({ example: 'mechanic-user-uuid' })
  @IsOptional()
  @IsString()
  mechanicId?: string;

  @ApiPropertyOptional({ enum: AssessmentStatus, example: AssessmentStatus.OPEN })
  @IsOptional()
  @IsEnum(AssessmentStatus)
  status?: AssessmentStatus;

  @ApiProperty({ example: 'Brake noise and weak stopping response.' })
  @IsString()
  issuesDetected: string;

  @ApiPropertyOptional({ example: 'Replace brake pads and inspect brake fluid.' })
  @IsOptional()
  @IsString()
  conclusion?: string;

  @ApiPropertyOptional({
    example: [
      { partName: 'Brake Pad Set', quantity: 2 },
      { partName: 'Oil Filter CFMOTO', quantity: 1 },
    ],
    description: 'Required parts list. Stored as JSON.',
  })
  @IsOptional()
  @IsArray()
  requiredParts?: any[];

  @ApiPropertyOptional({ example: ['photo-url-1.jpg'], description: 'Uploaded photo URLs or references.' })
  @IsOptional()
  @IsArray()
  photos?: any[];
}

export class UpdateAssessmentDto extends CreateAssessmentDto {}

export class ReopenAssessmentDto {
  @ApiProperty({ example: 'Additional part requirement found during repair.' })
  @IsString()
  reason: string;
}

export class IssuePartsDto {
  @ApiProperty({
    example: [{ partName: 'Brake Pad Set', quantity: 2, issuedBy: 'Store Keeper' }],
    description: 'Parts issued by store keeper.',
  })
  @IsArray()
  parts: any[];
}
