import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}
  async dashboard(){
    const [vehicles, inGarage, lowStock, assessments, transactions] = await Promise.all([
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where:{ status:{ in:['UNDER_REPAIR','BUILD_IN_PROGRESS','BUILT_TESTING'] } }}),
      this.prisma.inventoryItem.findMany(),
      this.prisma.assessment.count(),
      this.prisma.transaction.count(),
    ]);
    return { vehicles, inGarage, lowStock: lowStock.filter(x=>x.currentStock<=x.reorderLevel).length, assessments, transactions };
  }
  maintenanceHistory(){ return this.prisma.garageOperation.findMany({ include:{ vehicle:true, assessment:true }, orderBy:{ createdAt:'desc' }}); }
}
