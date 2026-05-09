import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function normalizeInventoryPayload(body: any) {
  const data: any = { ...body };

  if (data.stock !== undefined && data.currentStock === undefined) {
    data.currentStock = data.stock;
    delete data.stock;
  }

  if (data.currentStock !== undefined) data.currentStock = Number(data.currentStock);
  if (data.reorderLevel !== undefined) data.reorderLevel = Number(data.reorderLevel);
  if (data.costPrice !== undefined) data.costPrice = String(data.costPrice);
  if (data.sellingPrice !== undefined) data.sellingPrice = String(data.sellingPrice);

  return data;
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  }

  async lowStock() {
    const items = await this.findAll();
    return items.filter((i) => i.currentStock <= i.reorderLevel);
  }

  findOne(id: string) {
    return this.prisma.inventoryItem.findUnique({ where: { id } });
  }

  create(body: any) {
    return this.prisma.inventoryItem.create({
      data: normalizeInventoryPayload({
        ...body,
        currentStock: body.currentStock ?? body.stock ?? 0,
        reorderLevel: body.reorderLevel ?? 0,
      }),
    });
  }

  update(id: string, body: any) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data: normalizeInventoryPayload(body),
    });
  }
}
