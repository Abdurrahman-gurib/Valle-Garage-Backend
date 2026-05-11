import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@vallepark.com', description: 'Registered user email address.' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password.' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'admin', description: 'Optional frontend selected role: admin, mechanic, or store.' })
  @IsOptional()
  @IsString()
  role?: string;
}
