import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}
  findAll(){ return this.prisma.inventoryItem.findMany({ orderBy:{ name:'asc' }}); }
  async lowStock(){ const items = await this.findAll(); return items.filter(i => i.currentStock <= i.reorderLevel); }
  findOne(id:string){ return this.prisma.inventoryItem.findUnique({ where:{id} }); }
  create(body:any){ return this.prisma.inventoryItem.create({ data:{ ...body, currentStock:Number(body.currentStock??body.stock??0), reorderLevel:Number(body.reorderLevel??0) }}); }
  update(id:string, body:any){ return this.prisma.inventoryItem.update({ where:{id}, data: body }); }
}
