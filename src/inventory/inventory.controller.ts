import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { InventoryService } from './inventory.service';
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}
  @Get() findAll(){ return this.service.findAll(); }
  @Get('low-stock') lowStock(){ return this.service.lowStock(); }
  @Get(':id') findOne(@Param('id') id:string){ return this.service.findOne(id); }
  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post() create(@Body() body:any){ return this.service.create(body); }
  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Patch(':id') update(@Param('id') id:string, @Body() body:any){ return this.service.update(id, body); }
}
