import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { GarageOpsService } from './garage-ops.service';
import { CreateGarageOperationDto, UpdateGarageOperationDto } from './dto/garage-op.dto';

@ApiTags('Garage Operations')
@ApiBearerAuth('bearer')
@Controller('garage-ops')
export class GarageOpsController {
  constructor(private service: GarageOpsService) {}

  @Get()
  @ApiOperation({ summary: 'List garage operations' })
  findAll(){ return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get garage operation detail' })
  @ApiParam({ name: 'id', example: 'garage-operation-uuid' })
  findOne(@Param('id') id:string){ return this.service.findOne(id); }

  @Roles(Role.ADMIN, Role.MECHANIC)
  @Post()
  @ApiOperation({ summary: 'Create garage operation - Admin or Mechanic' })
  @ApiBody({ type: CreateGarageOperationDto })
  create(@Body() body: CreateGarageOperationDto, @Req() req:any){ return this.service.create(body, req.user.id); }

  @Roles(Role.ADMIN, Role.MECHANIC)
  @Patch(':id')
  @ApiOperation({ summary: 'Update garage operation status, labor, invoice or payment' })
  @ApiParam({ name: 'id', example: 'garage-operation-uuid' })
  @ApiBody({ type: UpdateGarageOperationDto })
  update(@Param('id') id:string, @Body() body: UpdateGarageOperationDto){ return this.service.update(id, body); }
}
