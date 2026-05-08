import { Controller, Get, Query, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}
  @Get() findAll(@Query('role') role: string, @Req() req: any){ return this.service.findAll(role || req.user.role); }
}
