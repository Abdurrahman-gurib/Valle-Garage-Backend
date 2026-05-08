import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { TransactionsService } from './transactions.service';
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}
  @Get() findAll(){ return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id:string){ return this.service.findOne(id); }
  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post() create(@Body() body:any, @Req() req:any){ return this.service.create(body, req.user.id); }
  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Patch(':id') update(@Param('id') id:string, @Body() body:any){ return this.service.update(id, body); }
  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post(':id/complete-with-grn') grn(@Param('id') id:string, @Body() body:any){ return this.service.completeWithGrn(id, body); }
}
