import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { GarageOpsService } from './garage-ops.service';
@Controller('garage-ops')
export class GarageOpsController {
  constructor(private service: GarageOpsService) {}
  @Get() findAll(){ return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id:string){ return this.service.findOne(id); }
  @Roles(Role.ADMIN, Role.MECHANIC)
  @Post() create(@Body() body:any, @Req() req:any){ return this.service.create(body, req.user.id); }
  @Roles(Role.ADMIN, Role.MECHANIC)
  @Patch(':id') update(@Param('id') id:string, @Body() body:any){ return this.service.update(id, body); }
}
