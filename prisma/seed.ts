import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.garageOperation.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash('admin123', 10);
  const mechanicHash = await bcrypt.hash('mech123', 10);
  const storeHash = await bcrypt.hash('store123', 10);

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@valle.com', passwordHash: adminHash, role: Role.ADMIN },
  });

  const mechanic = await prisma.user.create({
    data: { name: 'Mechanic User', email: 'mechanic@valle.com', passwordHash: mechanicHash, role: Role.MECHANIC },
  });

  await prisma.user.create({
    data: { name: 'Store Keeper User', email: 'store@valle.com', passwordHash: storeHash, role: Role.STORE_KEEPER },
  });

  const txn = await prisma.transaction.create({
    data: {
      transactionNo: 'TXN-0001',
      type: 'VEHICLE_ORDER',
      status: 'IN_PROGRESS',
      title: 'Customer Order - New Quad Build',
      customerName: 'External Adventure Client',
      poNumber: 'PO-CUST-001',
      amount: '450000',
      startDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 30 * 86400000),
      createdById: admin.id,
    },
  });

  const v1 = await prisma.vehicle.create({
    data: {
      plateNumber: 'CFM-1042',
      vin: 'LCELV1Z42P6001042',
      vehicleType: 'Quad',
      ownership: 'INTERNAL',
      ownerName: 'Vallé Internal Fleet',
      manufacturer: 'CFMOTO',
      status: 'UNDER_REPAIR',
      currentHourMeter: 1180,
      checkInDateTime: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 5 * 86400000),
      createdById: admin.id,
    },
  });

  const v2 = await prisma.vehicle.create({
    data: {
      plateNumber: 'BUILD-3001',
      vin: 'BUILD-VIN-3001',
      vehicleType: 'Quad',
      ownership: 'CUSTOMER_ORDER',
      ownerName: 'External Adventure Client',
      companyName: 'Adventure Client Ltd',
      deliveryPersonName: 'Kevin Delivery',
      contactNumber: '+230 5123 4567',
      email: 'client@example.com',
      manufacturer: 'CFMOTO',
      status: 'BUILD_IN_PROGRESS',
      currentHourMeter: 0,
      checkInDateTime: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 30 * 86400000),
      transactionId: txn.id,
      createdById: admin.id,
    },
  });

  await prisma.inventoryItem.createMany({
    data: [
      { sku: 'CF-OIL-221', name: 'Oil Filter CFMOTO', category: 'Service Parts', barcode: '889102210', currentStock: 7, reorderLevel: 10, costPrice: '250', sellingPrice: '450', supplierName: 'CFMOTO Supplier', supplierEmail: 'supplier@example.com', location: 'Quad Store' },
      { sku: 'CF-BRK-110', name: 'Brake Pad Set', category: 'Brake System', barcode: '889100110', currentStock: 34, reorderLevel: 12, costPrice: '850', sellingPrice: '1250', supplierName: 'CFMOTO Supplier', supplierEmail: 'supplier@example.com', location: 'Buggy Bay' },
      { sku: 'CF-BLT-501', name: 'Drive Belt', category: 'Transmission', barcode: '889105501', currentStock: 4, reorderLevel: 8, costPrice: '2600', sellingPrice: '3800', supplierName: 'CFMOTO Supplier', supplierEmail: 'supplier@example.com', location: 'Workshop' },
    ],
  });

  const asm = await prisma.assessment.create({
    data: {
      ticketNo: 'ASM-1001',
      vehicleId: v1.id,
      mechanicId: mechanic.id,
      status: 'READY_FOR_PARTS',
      issuesDetected: 'Brake noise and weak stopping response.',
      conclusion: 'Replace front brake pads and inspect brake fluid.',
      requiredParts: [{ partName: 'Brake Pad Set', quantity: 2 }],
      photos: [],
    },
  });

  await prisma.garageOperation.create({
    data: {
      processNo: 'PRC-501',
      vehicleId: v1.id,
      assessmentId: asm.id,
      processType: 'REPAIR',
      status: 'IN_PROGRESS',
      proceduresPerformed: 'Inspecting brake system and preparing vehicle for brake pad replacement.',
      partsUsed: [{ partName: 'Brake Pad Set', quantity: 2 }],
      mechanicId: mechanic.id,
      checkInDateTime: new Date(),
      startDateTime: new Date(),
      laborHours: '2.50',
      currentHourMeter: 1180,
      nextServiceDueAtHours: 1250,
      photos: [],
    },
  });

  await prisma.garageOperation.create({
    data: {
      processNo: 'PRC-502',
      vehicleId: v2.id,
      processType: 'ASSEMBLY',
      status: 'PENDING',
      proceduresPerformed: 'Customer vehicle build request waiting for assembly.',
      partsUsed: [],
      mechanicId: mechanic.id,
      checkInDateTime: new Date(),
      photos: [],
    },
  });

  await prisma.notification.createMany({
    data: [
      { title: 'Low Stock Alert', message: 'Drive Belt stock is below reorder level.', role: 'STORE_KEEPER' },
      { title: 'Parts Required', message: 'Assessment ASM-1001 requires parts issuance.', role: 'STORE_KEEPER' },
      { title: 'Garage Work Assigned', message: 'Garage operation PRC-501 is assigned to you.', role: 'MECHANIC' },
      { title: 'Vehicle Build Request', message: 'Customer vehicle BUILD-3001 is ready for assembly workflow.', role: 'MECHANIC' },
      { title: 'Transaction Update', message: 'Transaction TXN-0001 is currently in progress.', role: 'ADMIN' },
    ],
  });

  console.log('Seed complete. Demo logins:');
  console.log('Admin: admin@valle.com / admin123');
  console.log('Mechanic: mechanic@valle.com / mech123');
  console.log('Store Keeper: store@valle.com / store123');
}

main().finally(() => prisma.$disconnect());
