import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@ApiTags('Vehicles')
@ApiBearerAuth('bearer')
@Controller('vehicles')
export class VehiclesController {
  constructor(private service: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicles - Admin, Mechanic, Store Keeper' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle detail with assessments and garage history' })
  @ApiParam({ name: 'id', example: 'vehicle-uuid' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Roles(Role.ADMIN, Role.MECHANIC)
  @Post()
  @ApiOperation({ summary: 'Create vehicle - Admin or Mechanic' })
  @ApiBody({ type: CreateVehicleDto })
  create(@Body() body: CreateVehicleDto, @Req() req: any) { return this.service.create(body, req.user.id); }

  @Roles(Role.ADMIN, Role.MECHANIC, Role.STORE_KEEPER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle status/details' })
  @ApiParam({ name: 'id', example: 'vehicle-uuid' })
  @ApiBody({ type: UpdateVehicleDto })
  update(@Param('id') id: string, @Body() body: UpdateVehicleDto) { return this.service.update(id, body); }
}
