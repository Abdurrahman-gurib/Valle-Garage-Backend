import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto, IssuePartsDto, ReopenAssessmentDto, UpdateAssessmentDto } from './dto/assessment.dto';

@ApiTags('Assessments')
@ApiBearerAuth('bearer')
@Controller('assessments')
export class AssessmentsController {
  constructor(private service: AssessmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List assessments' })
  findAll(){ return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment detail' })
  @ApiParam({ name: 'id', example: 'assessment-uuid' })
  findOne(@Param('id') id:string){ return this.service.findOne(id); }

  @Roles(Role.ADMIN, Role.MECHANIC)
  @Post()
  @ApiOperation({ summary: 'Create assessment - Admin or Mechanic' })
  @ApiBody({ type: CreateAssessmentDto })
  create(@Body() body: CreateAssessmentDto, @Req() req:any){ return this.service.create(body, req.user.id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update assessment' })
  @ApiParam({ name: 'id', example: 'assessment-uuid' })
  @ApiBody({ type: UpdateAssessmentDto })
  update(@Param('id') id:string, @Body() body: UpdateAssessmentDto){ return this.service.update(id, body); }

  @Post(':id/reopen')
  @ApiOperation({ summary: 'Reopen assessment with accountable reason' })
  @ApiParam({ name: 'id', example: 'assessment-uuid' })
  @ApiBody({ type: ReopenAssessmentDto })
  reopen(@Param('id') id:string, @Body() body: ReopenAssessmentDto, @Req() req:any){ return this.service.reopen(id, body.reason, req.user.id); }

  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post(':id/issue-parts')
  @ApiOperation({ summary: 'Issue parts to assessment - Admin or Store Keeper' })
  @ApiParam({ name: 'id', example: 'assessment-uuid' })
  @ApiBody({ type: IssuePartsDto })
  issueParts(@Param('id') id:string, @Body() body: IssuePartsDto){ return this.service.issueParts(id, body.parts); }

  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark assessment completed after parts issuance' })
  @ApiParam({ name: 'id', example: 'assessment-uuid' })
  complete(@Param('id') id:string){ return this.service.complete(id); }
}
