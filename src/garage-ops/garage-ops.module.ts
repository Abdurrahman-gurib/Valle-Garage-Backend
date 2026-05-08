import { Module } from '@nestjs/common';
import { GarageOpsController } from './garage-ops.controller';
import { GarageOpsService } from './garage-ops.service';
@Module({ controllers: [GarageOpsController], providers: [GarageOpsService] })
export class GarageOpsModule {}
