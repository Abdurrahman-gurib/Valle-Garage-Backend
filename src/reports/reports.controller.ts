import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth('bearer')
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard report counters for frontend cards' })
  dashboard(){ return this.service.dashboard(); }

  @Get('maintenance-history')
  @ApiOperation({ summary: 'Full maintenance and garage operation history' })
  history(){ return this.service.maintenanceHistory(); }
}
