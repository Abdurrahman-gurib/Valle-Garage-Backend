import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssessmentsService } from './assessments.service';
@Controller('assessments')
export class AssessmentsController {
  constructor(private service: AssessmentsService) {}
  @Get() findAll(){ return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id:string){ return this.service.findOne(id); }
  @Roles(Role.ADMIN, Role.MECHANIC)
  @Post() create(@Body() body:any, @Req() req:any){ return this.service.create(body, req.user.id); }
  @Patch(':id') update(@Param('id') id:string, @Body() body:any){ return this.service.update(id, body); }
  @Post(':id/reopen') reopen(@Param('id') id:string, @Body() body:any, @Req() req:any){ return this.service.reopen(id, body.reason || body.reopenReason, req.user.id); }
  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post(':id/issue-parts') issueParts(@Param('id') id:string, @Body() body:any){ return this.service.issueParts(id, body.parts || body.requiredParts); }
  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post(':id/complete') complete(@Param('id') id:string){ return this.service.complete(id); }
}
