import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}
  findAll(role?: any){ return this.prisma.notification.findMany({ where: role ? { OR:[{role},{role:null}] } : {}, orderBy:{createdAt:'desc'} }); }
}
