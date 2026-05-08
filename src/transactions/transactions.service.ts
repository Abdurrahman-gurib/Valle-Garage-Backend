import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toDate } from '../common/utils';
const typeMap:any={'Parts Purchase':'PART_PURCHASE','Vehicle Order':'VEHICLE_ORDER','Service Invoice':'SERVICE_INVOICE'};
const statusMap:any={'Pending':'PENDING','In Progress':'IN_PROGRESS','Completed':'COMPLETED','Paid':'PAID','Cancelled':'CANCELLED'};
@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}
  findAll(){ return this.prisma.transaction.findMany({ include:{ createdBy:true, vehicles:true }, orderBy:{createdAt:'desc'} }); }
  findOne(id:string){ return this.prisma.transaction.findUnique({ where:{id}, include:{ createdBy:true, vehicles:true } }); }
  async create(body:any, userId:string){
    const count = await this.prisma.transaction.count();
    return this.prisma.transaction.create({ data:{
      transactionNo: body.transactionNo || `TXN-${String(count+1).padStart(4,'0')}`,
      type: typeMap[body.type] || body.type || 'PART_PURCHASE',
      status: statusMap[body.status] || body.status || 'PENDING',
      title: body.title,
      supplierName: body.supplierName || body.supplier,
      supplierEmail: body.supplierEmail,
      customerName: body.customerName,
      startDate: toDate(body.startDate),
      expectedDeliveryDate: toDate(body.expectedDeliveryDate),
      poNumber: body.poNumber,
      poAttachmentUrl: body.poAttachmentUrl,
      invoiceAttachmentUrl: body.invoiceAttachmentUrl,
      grnAttachmentUrl: body.grnAttachmentUrl,
      grnData: body.grnData,
      amount: body.amount ? String(body.amount) : undefined,
      notes: body.notes,
      createdById: userId,
    }});
  }
  update(id:string, body:any){
    const data:any={...body};
    if(data.type) data.type=typeMap[data.type] || data.type;
    if(data.status) data.status=statusMap[data.status] || data.status;
    if(data.startDate) data.startDate=toDate(data.startDate);
    if(data.expectedDeliveryDate) data.expectedDeliveryDate=toDate(data.expectedDeliveryDate);
    if(data.amount) data.amount=String(data.amount);
    return this.prisma.transaction.update({ where:{id}, data });
  }
  completeWithGrn(id:string, body:any){ return this.prisma.transaction.update({ where:{id}, data:{ status:'COMPLETED', grnData: body.grnData || body, grnAttachmentUrl: body.grnAttachmentUrl }}); }
}
