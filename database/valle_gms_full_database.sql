
-- ============================================================
-- Vallé GMS PostgreSQL Database Setup
-- Garage & Spare Parts Management System
-- Compatible with NestJS + Prisma backend
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "GarageOperation" CASCADE;
DROP TABLE IF EXISTS "Assessment" CASCADE;
DROP TABLE IF EXISTS "InventoryItem" CASCADE;
DROP TABLE IF EXISTS "Vehicle" CASCADE;
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "VehicleStatus" CASCADE;
DROP TYPE IF EXISTS "VehicleOwnership" CASCADE;
DROP TYPE IF EXISTS "AssessmentStatus" CASCADE;
DROP TYPE IF EXISTS "GarageProcessType" CASCADE;
DROP TYPE IF EXISTS "GarageStatus" CASCADE;
DROP TYPE IF EXISTS "TransactionType" CASCADE;
DROP TYPE IF EXISTS "TransactionStatus" CASCADE;

CREATE TYPE "Role" AS ENUM ('ADMIN', 'MECHANIC', 'STORE_KEEPER');

CREATE TYPE "VehicleStatus" AS ENUM (
  'ACTIVE',
  'UNDER_REPAIR',
  'OUT_OF_SERVICE',
  'BUILD_IN_PROGRESS',
  'BUILT_TESTING',
  'DELIVERED'
);

CREATE TYPE "VehicleOwnership" AS ENUM (
  'INTERNAL',
  'EXTERNAL',
  'CUSTOMER_ORDER'
);

CREATE TYPE "AssessmentStatus" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'READY_FOR_PARTS',
  'PARTS_ISSUED',
  'COMPLETED',
  'REOPENED'
);

CREATE TYPE "GarageProcessType" AS ENUM (
  'REPAIR',
  'MAINTENANCE',
  'SERVICING',
  'ASSEMBLY',
  'TESTING'
);

CREATE TYPE "GarageStatus" AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "TransactionType" AS ENUM (
  'PART_PURCHASE',
  'VEHICLE_ORDER',
  'SERVICE_INVOICE'
);

CREATE TYPE "TransactionStatus" AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'PAID',
  'CANCELLED'
);

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Transaction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "transactionNo" TEXT NOT NULL UNIQUE,
  "type" "TransactionType" NOT NULL,
  "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
  "title" TEXT NOT NULL,
  "supplierName" TEXT,
  "supplierEmail" TEXT,
  "customerName" TEXT,
  "startDate" TIMESTAMP(3),
  "expectedDeliveryDate" TIMESTAMP(3),
  "poNumber" TEXT,
  "poAttachmentUrl" TEXT,
  "invoiceAttachmentUrl" TEXT,
  "grnAttachmentUrl" TEXT,
  "grnData" JSONB,
  "amount" DECIMAL(12,2),
  "notes" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Transaction_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Vehicle" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "plateNumber" TEXT NOT NULL UNIQUE,
  "vin" TEXT,
  "vehicleType" TEXT NOT NULL,
  "ownership" "VehicleOwnership" NOT NULL DEFAULT 'INTERNAL',
  "ownerName" TEXT,
  "companyName" TEXT,
  "deliveryPersonName" TEXT,
  "contactNumber" TEXT,
  "email" TEXT,
  "manufacturer" TEXT,
  "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
  "currentHourMeter" INTEGER NOT NULL DEFAULT 0,
  "checkInDateTime" TIMESTAMP(3),
  "expectedDeliveryDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdById" TEXT,
  "transactionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vehicle_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Vehicle_transactionId_fkey"
    FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Assessment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "ticketNo" TEXT NOT NULL UNIQUE,
  "vehicleId" TEXT NOT NULL,
  "mechanicId" TEXT,
  "status" "AssessmentStatus" NOT NULL DEFAULT 'OPEN',
  "issuesDetected" TEXT NOT NULL,
  "conclusion" TEXT,
  "requiredParts" JSONB,
  "reopenReason" TEXT,
  "reopenedById" TEXT,
  "reopenedAt" TIMESTAMP(3),
  "photos" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Assessment_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Assessment_mechanicId_fkey"
    FOREIGN KEY ("mechanicId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Assessment_reopenedById_fkey"
    FOREIGN KEY ("reopenedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "InventoryItem" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "sku" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "barcode" TEXT UNIQUE,
  "currentStock" INTEGER NOT NULL DEFAULT 0,
  "reorderLevel" INTEGER NOT NULL DEFAULT 0,
  "costPrice" DECIMAL(12,2),
  "sellingPrice" DECIMAL(12,2),
  "supplierName" TEXT,
  "supplierEmail" TEXT,
  "location" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "GarageOperation" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "processNo" TEXT NOT NULL UNIQUE,
  "vehicleId" TEXT NOT NULL,
  "assessmentId" TEXT,
  "processType" "GarageProcessType" NOT NULL,
  "status" "GarageStatus" NOT NULL DEFAULT 'PENDING',
  "proceduresPerformed" TEXT,
  "partsUsed" JSONB,
  "mechanicId" TEXT,
  "checkInDateTime" TIMESTAMP(3),
  "startDateTime" TIMESTAMP(3),
  "endDateTime" TIMESTAMP(3),
  "laborHours" DECIMAL(8,2),
  "currentHourMeter" INTEGER,
  "nextServiceDueAtHours" INTEGER,
  "invoiceAttachmentUrl" TEXT,
  "paymentDone" BOOLEAN NOT NULL DEFAULT FALSE,
  "photos" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GarageOperation_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GarageOperation_assessmentId_fkey"
    FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "GarageOperation_mechanicId_fkey"
    FOREIGN KEY ("mechanicId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Notification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "role" "Role",
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");
CREATE INDEX "Vehicle_ownership_idx" ON "Vehicle"("ownership");
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");
CREATE INDEX "GarageOperation_status_idx" ON "GarageOperation"("status");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

INSERT INTO "User" ("id", "name", "email", "passwordHash", "role")
VALUES
('user-admin-001', 'Admin User', 'admin@valle.com', crypt('admin123', gen_salt('bf')), 'ADMIN'),
('user-mech-001', 'Mechanic User', 'mechanic@valle.com', crypt('mech123', gen_salt('bf')), 'MECHANIC'),
('user-store-001', 'Store Keeper User', 'store@valle.com', crypt('store123', gen_salt('bf')), 'STORE_KEEPER');

INSERT INTO "Transaction" (
  "id", "transactionNo", "type", "status", "title", "supplierName",
  "supplierEmail", "customerName", "startDate", "expectedDeliveryDate",
  "poNumber", "amount", "notes", "createdById"
)
VALUES
('txn-001', 'TXN-0001', 'PART_PURCHASE', 'IN_PROGRESS', 'Reorder Drive Belts and Brake Pads',
 'CFMOTO Supplier', 'supplier@example.com', NULL, CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP + INTERVAL '14 days', 'PO-0001', 78000.00,
 'Urgent reorder for low-stock workshop items.', 'user-admin-001'),
('txn-002', 'TXN-0002', 'VEHICLE_ORDER', 'PENDING', 'Customer Order - New Quad Build',
 NULL, NULL, 'External Adventure Client', CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP + INTERVAL '30 days', 'CUST-PO-2201', 450000.00,
 'Customer ordered a new quad to be assembled and tested.', 'user-admin-001');

INSERT INTO "Vehicle" (
  "id", "plateNumber", "vin", "vehicleType", "ownership", "ownerName",
  "companyName", "deliveryPersonName", "contactNumber", "email", "manufacturer",
  "status", "currentHourMeter", "checkInDateTime", "expectedDeliveryDate",
  "notes", "createdById", "transactionId"
)
VALUES
('veh-001', 'CFM-1042', 'LCELV1Z42P6001042', 'Quad', 'INTERNAL', 'Vallé Internal Fleet',
 NULL, NULL, NULL, NULL, 'CFMOTO', 'UNDER_REPAIR', 1180,
 CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '5 days',
 'Brake issue reported after morning trail.', 'user-admin-001', NULL),
('veh-002', 'BUG-2201', 'BUGGY-VIN-2201', 'Buggy', 'INTERNAL', 'Vallé Internal Fleet',
 NULL, NULL, NULL, NULL, 'CFMOTO', 'ACTIVE', 820,
 NULL, NULL, 'Ready for customer rides.', 'user-admin-001', NULL),
('veh-003', 'BUILD-3001', 'BUILD-VIN-3001', 'Quad', 'CUSTOMER_ORDER', 'External Adventure Client',
 'Adventure Client Ltd', 'Kevin Delivery', '+230 5123 4567', 'client@example.com',
 'CFMOTO', 'BUILD_IN_PROGRESS', 0,
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days',
 'Vehicle created from customer purchase order.', 'user-admin-001', 'txn-002');

INSERT INTO "InventoryItem" (
  "id", "sku", "name", "category", "barcode", "currentStock", "reorderLevel",
  "costPrice", "sellingPrice", "supplierName", "supplierEmail", "location"
)
VALUES
('inv-001', 'CF-OIL-221', 'Oil Filter CFMOTO', 'Service Parts', '889102210', 7, 10, 250.00, 450.00, 'CFMOTO Supplier', 'supplier@example.com', 'Quad Store'),
('inv-002', 'CF-BRK-110', 'Brake Pad Set', 'Brake System', '889100110', 34, 12, 850.00, 1250.00, 'CFMOTO Supplier', 'supplier@example.com', 'Buggy Bay'),
('inv-003', 'CF-BLT-501', 'Drive Belt', 'Transmission', '889105501', 4, 8, 2600.00, 3800.00, 'CFMOTO Supplier', 'supplier@example.com', 'Workshop'),
('inv-004', 'CF-SPK-330', 'Spark Plug', 'Engine Parts', '889103330', 58, 20, 150.00, 290.00, 'CFMOTO Supplier', 'supplier@example.com', 'CFMOTO Store');

INSERT INTO "Assessment" (
  "id", "ticketNo", "vehicleId", "mechanicId", "status", "issuesDetected",
  "conclusion", "requiredParts", "photos"
)
VALUES
('asm-001', 'ASM-1001', 'veh-001', 'user-mech-001', 'READY_FOR_PARTS',
 'Brake noise and weak stopping response.',
 'Replace front brake pads and inspect brake fluid.',
 '[{"partName":"Brake Pad Set","quantity":2},{"partName":"Oil Filter CFMOTO","quantity":1}]',
 '[]'),
('asm-002', 'ASM-1002', 'veh-002', 'user-mech-001', 'COMPLETED',
 'Routine service due.',
 'Oil and filter replacement completed.',
 '[{"partName":"Oil Filter CFMOTO","quantity":1}]',
 '[]');

INSERT INTO "GarageOperation" (
  "id", "processNo", "vehicleId", "assessmentId", "processType", "status",
  "proceduresPerformed", "partsUsed", "mechanicId", "checkInDateTime",
  "startDateTime", "laborHours", "currentHourMeter", "nextServiceDueAtHours",
  "paymentDone", "photos"
)
VALUES
('gop-001', 'PRC-501', 'veh-001', 'asm-001', 'REPAIR', 'IN_PROGRESS',
 'Inspecting brake system and preparing vehicle for brake pad replacement.',
 '[{"partName":"Brake Pad Set","quantity":2}]',
 'user-mech-001', CURRENT_TIMESTAMP - INTERVAL '2 days',
 CURRENT_TIMESTAMP - INTERVAL '1 day', 2.50, 1180, 1250, FALSE, '[]'),
('gop-002', 'PRC-502', 'veh-002', 'asm-002', 'SERVICING', 'COMPLETED',
 'Oil filter replaced and routine service completed.',
 '[{"partName":"Oil Filter CFMOTO","quantity":1}]',
 'user-mech-001', CURRENT_TIMESTAMP - INTERVAL '10 days',
 CURRENT_TIMESTAMP - INTERVAL '9 days', 1.25, 820, 900, TRUE, '[]');

INSERT INTO "Notification" ("title", "message", "role")
VALUES
('Low Stock Alert', 'Drive Belt stock is below reorder level.', 'STORE_KEEPER'),
('Parts Required', 'Assessment ASM-1001 requires parts issuance.', 'STORE_KEEPER'),
('Garage Work Assigned', 'Garage operation PRC-501 is assigned to you.', 'MECHANIC'),
('Vehicle Build Request', 'Customer vehicle BUILD-3001 is ready for assembly workflow.', 'MECHANIC'),
('Transaction Update', 'Transaction TXN-0001 is currently in progress.', 'ADMIN');
