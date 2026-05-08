import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cleanUndefined, toDate } from '../common/utils';
const statusMap:any={ 'Active':'ACTIVE','Under Repair':'UNDER_REPAIR','Out of Service':'OUT_OF_SERVICE','Build in Progress':'BUILD_IN_PROGRESS','Built and Testing':'BUILT_TESTING','Delivered':'DELIVERED' };
const ownerMap:any={ 'Internal':'INTERNAL','External':'EXTERNAL','Customer Order':'CUSTOMER_ORDER' };
@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}
  findAll(){ return this.prisma.vehicle.findMany({ include:{ assessments:true, garageOps:true, transaction:true }, orderBy:{ createdAt:'desc' }}); }
  findOne(id:string){ return this.prisma.vehicle.findUnique({ where:{id}, include:{ assessments:true, garageOps:true, transaction:true }}); }
  create(body:any, userId:string){
    return this.prisma.vehicle.create({ data: cleanUndefined({
      plateNumber: body.plateNumber || body.plate,
      vin: body.vin,
      vehicleType: body.vehicleType || body.type || body.customType || 'Quad',
      ownership: ownerMap[body.ownership] || body.ownership || 'INTERNAL',
      ownerName: body.ownerName || body.owner,
      companyName: body.companyName,
      deliveryPersonName: body.deliveryPersonName,
      contactNumber: body.contactNumber,
      email: body.email,
      manufacturer: body.manufacturer || 'CFMOTO',
      status: statusMap[body.status] || body.status || 'ACTIVE',
      currentHourMeter: Number(body.currentHourMeter ?? body.hours ?? 0),
      checkInDateTime: toDate(body.checkInDateTime),
      expectedDeliveryDate: toDate(body.expectedDeliveryDate),
      notes: body.notes,
      createdById: userId,
      transactionId: body.transactionId || body.sourceTransactionId,
    }) });
  }
  update(id:string, body:any){
    const data:any = { ...body };
    if(data.plate) data.plateNumber=data.plate, delete data.plate;
    if(data.type) data.vehicleType=data.type, delete data.type;
    if(data.status) data.status=statusMap[data.status] || data.status;
    if(data.ownership) data.ownership=ownerMap[data.ownership] || data.ownership;
    if(data.hours) data.currentHourMeter=Number(data.hours), delete data.hours;
    if(data.checkInDateTime) data.checkInDateTime=toDate(data.checkInDateTime);
    if(data.expectedDeliveryDate) data.expectedDeliveryDate=toDate(data.expectedDeliveryDate);
    return this.prisma.vehicle.update({ where:{id}, data });
  }
}
