import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}
  @Get('dashboard') dashboard(){ return this.service.dashboard(); }
  @Get('maintenance-history') history(){ return this.service.maintenanceHistory(); }
}
