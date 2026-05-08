import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toDate } from '../common/utils';
const typeMap:any={'Repair':'REPAIR','Maintenance':'MAINTENANCE','Servicing':'SERVICING','Build / Assembly':'ASSEMBLY','Testing':'TESTING','Pre Delivery Inspection':'TESTING'};
const statusMap:any={'Pending':'PENDING','In Progress':'IN_PROGRESS','Completed':'COMPLETED','Cancelled':'CANCELLED'};
@Injectable()
export class GarageOpsService {
  constructor(private prisma: PrismaService) {}
  findAll(){ return this.prisma.garageOperation.findMany({ include:{ vehicle:true, assessment:true, mechanic:true }, orderBy:{createdAt:'desc'} }); }
  findOne(id:string){ return this.prisma.garageOperation.findUnique({ where:{id}, include:{ vehicle:true, assessment:true, mechanic:true } }); }
  async create(body:any, userId:string){
    const count = await this.prisma.garageOperation.count();
    return this.prisma.garageOperation.create({ data:{
      processNo: body.processNo || `PRC-${501+count}`,
      vehicleId: body.vehicleId,
      assessmentId: body.assessmentId || undefined,
      processType: typeMap[body.processType] || body.processType || 'REPAIR',
      status: statusMap[body.status] || body.status || 'PENDING',
      proceduresPerformed: body.proceduresPerformed || body.workDone,
      partsUsed: body.partsUsed || [],
      mechanicId: body.mechanicId || userId,
      checkInDateTime: toDate(body.checkInDateTime),
      startDateTime: toDate(body.startDateTime),
      endDateTime: toDate(body.endDateTime),
      laborHours: body.laborHours ? String(body.laborHours) : undefined,
      currentHourMeter: body.currentHourMeter ? Number(body.currentHourMeter) : undefined,
      nextServiceDueAtHours: body.nextServiceDueAtHours ? Number(body.nextServiceDueAtHours) : undefined,
      invoiceAttachmentUrl: body.invoiceAttachmentUrl,
      paymentDone: Boolean(body.paymentDone),
      photos: body.photos || [],
    }});
  }
  update(id:string, body:any){
    const data:any={...body};
    if(data.processType) data.processType=typeMap[data.processType] || data.processType;
    if(data.status) data.status=statusMap[data.status] || data.status;
    if(data.checkInDateTime) data.checkInDateTime=toDate(data.checkInDateTime);
    if(data.startDateTime) data.startDateTime=toDate(data.startDateTime);
    if(data.endDateTime) data.endDateTime=toDate(data.endDateTime);
    return this.prisma.garageOperation.update({ where:{id}, data });
  }
}
