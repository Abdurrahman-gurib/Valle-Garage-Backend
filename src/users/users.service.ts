import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeRole } from '../common/utils';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.user.findMany({ select: { id:true,name:true,email:true,role:true,isActive:true,createdAt:true,updatedAt:true }}); }
  findOne(id: string) { return this.prisma.user.findUnique({ where: { id }, select: { id:true,name:true,email:true,role:true,isActive:true,createdAt:true,updatedAt:true }}); }
  async create(body: any) {
    const passwordHash = await bcrypt.hash(body.password || 'password123', 10);
    return this.prisma.user.create({ data: { name: body.name, email: body.email, passwordHash, role: normalizeRole(body.role), isActive: body.isActive ?? true }, select: { id:true,name:true,email:true,role:true,isActive:true }});
  }
  async update(id: string, body: any) {
    const data: any = { ...body };
    if (data.role) data.role = normalizeRole(data.role);
    if (data.password) { data.passwordHash = await bcrypt.hash(data.password,10); delete data.password; }
    return this.prisma.user.update({ where: { id }, data, select: { id:true,name:true,email:true,role:true,isActive:true }});
  }
}
