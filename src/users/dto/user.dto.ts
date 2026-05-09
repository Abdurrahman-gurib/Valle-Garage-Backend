import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Jean Marc', description: 'Full name of the user.' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jean.marc@valle.com', description: 'Unique login email.' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Temporary or chosen password.' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: Role.MECHANIC, description: 'System role.' })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({ example: true, description: 'Whether user is active.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jean Marc Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'jean.updated@valle.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'newpass123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.STORE_KEEPER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
