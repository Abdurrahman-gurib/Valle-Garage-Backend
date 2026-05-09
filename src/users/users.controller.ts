import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users - Admin only' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID - Admin only' })
  @ApiParam({ name: 'id', example: 'user-uuid' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Create user - Admin only' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() body: CreateUserDto) { return this.service.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user - Admin only' })
  @ApiParam({ name: 'id', example: 'user-uuid' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() body: UpdateUserDto) { return this.service.update(id, body); }
}
