import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.assessment.findMany({
      include: { vehicle: true, mechanic: true, garageOps: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.assessment.findUnique({
      where: { id },
      include: { vehicle: true, mechanic: true, garageOps: true },
    });
  }

  async create(body: any, userId: string) {
    const count = await this.prisma.assessment.count();
    return this.prisma.assessment.create({
      data: {
        ticketNo: body.ticketNo || `ASM-${1001 + count}`,
        vehicleId: body.vehicleId,
        mechanicId: body.mechanicId || userId,
        status: body.status || 'OPEN',
        issuesDetected: body.issuesDetected || body.issue || 'General inspection required.',
        conclusion: body.conclusion,
        requiredParts: body.requiredParts || body.parts || [],
        photos: body.photos || [],
      },
    });
  }

  update(id: string, body: any) {
    return this.prisma.assessment.update({ where: { id }, data: body });
  }

  reopen(id: string, reason: string, userId: string) {
    return this.prisma.assessment.update({
      where: { id },
      data: {
        status: 'REOPENED',
        reopenReason: reason || 'Reopened for correction or additional parts requirement.',
        reopenedById: userId,
        reopenedAt: new Date(),
      },
    });
  }

  issueParts(id: string, parts: any) {
    return this.prisma.assessment.update({
      where: { id },
      data: { status: 'PARTS_ISSUED', requiredParts: parts || undefined },
    });
  }

  complete(id: string) {
    return this.prisma.assessment.update({ where: { id }, data: { status: 'COMPLETED' } });
  }
}
