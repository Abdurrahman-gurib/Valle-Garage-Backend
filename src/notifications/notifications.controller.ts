import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('bearer')
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications. Optional role filter.' })
  @ApiQuery({ name: 'role', required: false, enum: Role, example: Role.MECHANIC })
  findAll(@Query('role') role: string, @Req() req: any){ return this.service.findAll(role || req.user.role); }
}
