
-- ============================================================
-- Vallé GMS Demo Data Seed
-- Database: valle_garage
-- Purpose: Add visible demo records for every table so frontend/backend APIs
--          can display data and confirm inserts are stored in PostgreSQL.
-- ============================================================

-- IMPORTANT:
-- Run this after your schema/tables already exist.

-- Optional cleanup of previous demo seed data only
DELETE FROM "Notification" WHERE "id" LIKE 'demo-%';
DELETE FROM "GarageOperation" WHERE "id" LIKE 'demo-%';
DELETE FROM "Assessment" WHERE "id" LIKE 'demo-%';
DELETE FROM "InventoryItem" WHERE "id" LIKE 'demo-%';
DELETE FROM "Vehicle" WHERE "id" LIKE 'demo-%';
DELETE FROM "Transaction" WHERE "id" LIKE 'demo-%';
DELETE FROM "User" WHERE "id" LIKE 'demo-%';

-- ============================================================
-- USERS
-- Password hashes are for demo passwords:
-- admin123, mech123, store123
-- ============================================================

INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "isActive")
VALUES
(
  'demo-user-admin',
  'Admin User',
  'admin@valle.com',
  '$2b$10$9Pp.WZbJf0xP8oM2nsAp7OCfVcw1dcdNTPcqILaWUgDaUuVHg1M8u',
  'ADMIN',
  true
),
(
  'demo-user-mechanic',
  'Jean Marc Mechanic',
  'mechanic@valle.com',
  '$2b$10$wkUvKwYz9L3cUbxfrlB1EunaVLMaDmrYAsgRtNSUiKrBT47fwjySK',
  'MECHANIC',
  true
),
(
  'demo-user-store',
  'CFMOTO Store Keeper',
  'store@valle.com',
  '$2b$10$rmKlyV0f8.nGaM1YgEPtM.GWOO3jkVz6XNEnYUXUGvZR3.qBV28Bu',
  'STORE_KEEPER',
  true
)
ON CONFLICT ("email") DO NOTHING;

-- ============================================================
-- TRANSACTIONS / PURCHASE ORDERS
-- ============================================================

INSERT INTO "Transaction" (
  "id", "transactionNo", "type", "status", "title", "supplierName",
  "supplierEmail", "customerName", "startDate", "expectedDeliveryDate",
  "poNumber", "poAttachmentUrl", "invoiceAttachmentUrl", "grnAttachmentUrl",
  "grnData", "amount", "notes", "createdById"
)
VALUES
(
  'demo-txn-parts-001',
  'TXN-DEMO-001',
  'PART_PURCHASE',
  'IN_PROGRESS',
  'Reorder CFMOTO Service Parts',
  'CFMOTO Mauritius Supplier',
  'supplier@example.com',
  null,
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  CURRENT_TIMESTAMP + INTERVAL '10 days',
  'PO-DEMO-001',
  '/uploads/po/PO-DEMO-001.pdf',
  null,
  null,
  null,
  78500.00,
  'Demo parts reorder transaction for low-stock items.',
  'demo-user-admin'
),
(
  'demo-txn-vehicle-001',
  'TXN-DEMO-002',
  'VEHICLE_ORDER',
  'PENDING',
  'Customer Order - Quad Assembly',
  null,
  null,
  'Adventure Client Ltd',
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  CURRENT_TIMESTAMP + INTERVAL '21 days',
  'CUSTOMER-PO-DEMO-002',
  '/uploads/po/CUSTOMER-PO-DEMO-002.pdf',
  null,
  null,
  null,
  450000.00,
  'Demo customer PO for a new quad build.',
  'demo-user-admin'
),
(
  'demo-txn-service-001',
  'TXN-DEMO-003',
  'SERVICE_INVOICE',
  'PAID',
  'Repair Invoice - Buggy Service',
  null,
  null,
  'Walk-in Customer',
  CURRENT_TIMESTAMP - INTERVAL '8 days',
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  null,
  null,
  '/uploads/invoices/INV-DEMO-003.pdf',
  '/uploads/grn/GRN-DEMO-003.pdf',
  '{"receivedBy":"CFMOTO Store Keeper","receivedDate":"2026-05-09","remarks":"Demo GRN saved for completed transaction"}',
  12500.00,
  'Demo paid service invoice transaction.',
  'demo-user-admin'
)
ON CONFLICT ("transactionNo") DO NOTHING;

-- ============================================================
-- VEHICLES
-- ============================================================

INSERT INTO "Vehicle" (
  "id", "plateNumber", "vin", "vehicleType", "ownership", "ownerName",
  "companyName", "deliveryPersonName", "contactNumber", "email",
  "manufacturer", "status", "currentHourMeter", "checkInDateTime",
  "expectedDeliveryDate", "notes", "createdById", "transactionId"
)
VALUES
(
  'demo-veh-001',
  'CFM-1042',
  'LCELV1Z42P6001042',
  'Quad',
  'INTERNAL',
  'Vallé Internal Fleet',
  null,
  null,
  null,
  null,
  'CFMOTO',
  'UNDER_REPAIR',
  1180,
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  CURRENT_TIMESTAMP + INTERVAL '4 days',
  'Brake issue reported after trail ride.',
  'demo-user-admin',
  null
),
(
  'demo-veh-002',
  'BUG-2201',
  'BUGGY-VIN-2201',
  'Buggy',
  'INTERNAL',
  'Vallé Internal Fleet',
  null,
  null,
  null,
  null,
  'CFMOTO',
  'ACTIVE',
  820,
  null,
  null,
  'Ready for operation.',
  'demo-user-admin',
  null
),
(
  'demo-veh-003',
  'EXT-7788',
  'EXT-VIN-7788',
  'Jeep',
  'EXTERNAL',
  'External Customer',
  'Island Tours Ltd',
  'Kevin Delivery',
  '+230 5123 4567',
  'client@example.com',
  'Jeep',
  'UNDER_REPAIR',
  1540,
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  CURRENT_TIMESTAMP + INTERVAL '7 days',
  'External vehicle checked in by delivery person.',
  'demo-user-mechanic',
  null
),
(
  'demo-veh-004',
  'BUILD-3001',
  'BUILD-VIN-3001',
  'Quad',
  'CUSTOMER_ORDER',
  'Adventure Client Ltd',
  'Adventure Client Ltd',
  'Ravi Delivery',
  '+230 5988 4411',
  'orders@example.com',
  'CFMOTO',
  'BUILD_IN_PROGRESS',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '21 days',
  'Vehicle created from customer PO and awaiting assembly.',
  'demo-user-admin',
  'demo-txn-vehicle-001'
)
ON CONFLICT ("plateNumber") DO NOTHING;

-- ============================================================
-- INVENTORY ITEMS
-- ============================================================

INSERT INTO "InventoryItem" (
  "id", "sku", "name", "category", "barcode", "currentStock", "reorderLevel",
  "costPrice", "sellingPrice", "supplierName", "supplierEmail", "location"
)
VALUES
(
  'demo-inv-001',
  'CF-OIL-221',
  'Oil Filter CFMOTO',
  'Service Parts',
  '889102210',
  7,
  10,
  250.00,
  450.00,
  'CFMOTO Mauritius Supplier',
  'supplier@example.com',
  'Shelf A1'
),
(
  'demo-inv-002',
  'CF-BRK-110',
  'Brake Pad Set',
  'Brake System',
  '889100110',
  34,
  12,
  850.00,
  1250.00,
  'CFMOTO Mauritius Supplier',
  'supplier@example.com',
  'Brake Bay'
),
(
  'demo-inv-003',
  'CF-BLT-501',
  'Drive Belt',
  'Transmission',
  '889105501',
  4,
  8,
  2600.00,
  3800.00,
  'CFMOTO Mauritius Supplier',
  'supplier@example.com',
  'Shelf B2'
),
(
  'demo-inv-004',
  'CF-SPK-330',
  'Spark Plug',
  'Engine Parts',
  '889103330',
  58,
  20,
  150.00,
  290.00,
  'CFMOTO Mauritius Supplier',
  'supplier@example.com',
  'Shelf C1'
)
ON CONFLICT ("sku") DO NOTHING;

-- ============================================================
-- ASSESSMENTS
-- ============================================================

INSERT INTO "Assessment" (
  "id", "ticketNo", "vehicleId", "mechanicId", "status", "issuesDetected",
  "conclusion", "requiredParts", "reopenReason", "reopenedById", "reopenedAt",
  "photos"
)
VALUES
(
  'demo-asm-001',
  'ASM-DEMO-1001',
  'demo-veh-001',
  'demo-user-mechanic',
  'READY_FOR_PARTS',
  'Brake noise and weak stopping response.',
  'Replace brake pads and inspect brake fluid.',
  '[{"partName":"Brake Pad Set","quantity":2},{"partName":"Oil Filter CFMOTO","quantity":1}]',
  null,
  null,
  null,
  '[]'
),
(
  'demo-asm-002',
  'ASM-DEMO-1002',
  'demo-veh-002',
  'demo-user-mechanic',
  'COMPLETED',
  'Routine service due.',
  'Oil filter replaced and service completed.',
  '[{"partName":"Oil Filter CFMOTO","quantity":1},{"partName":"Spark Plug","quantity":2}]',
  null,
  null,
  null,
  '[]'
),
(
  'demo-asm-003',
  'ASM-DEMO-1003',
  'demo-veh-003',
  'demo-user-mechanic',
  'REOPENED',
  'Engine vibration under load.',
  'Additional belt inspection required.',
  '[{"partName":"Drive Belt","quantity":1}]',
  'Mechanic found extra belt wear after initial inspection.',
  'demo-user-mechanic',
  CURRENT_TIMESTAMP - INTERVAL '3 hours',
  '[]'
)
ON CONFLICT ("ticketNo") DO NOTHING;

-- ============================================================
-- GARAGE OPERATIONS
-- ============================================================

INSERT INTO "GarageOperation" (
  "id", "processNo", "vehicleId", "assessmentId", "processType", "status",
  "proceduresPerformed", "partsUsed", "mechanicId", "checkInDateTime",
  "startDateTime", "endDateTime", "laborHours", "currentHourMeter",
  "nextServiceDueAtHours", "invoiceAttachmentUrl", "paymentDone", "photos"
)
VALUES
(
  'demo-gop-001',
  'PRC-DEMO-501',
  'demo-veh-001',
  'demo-asm-001',
  'REPAIR',
  'IN_PROGRESS',
  'Inspecting brake system and preparing replacement.',
  '[{"partName":"Brake Pad Set","quantity":2}]',
  'demo-user-mechanic',
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  null,
  2.50,
  1180,
  1250,
  null,
  false,
  '[]'
),
(
  'demo-gop-002',
  'PRC-DEMO-502',
  'demo-veh-002',
  'demo-asm-002',
  'SERVICING',
  'COMPLETED',
  'Oil filter replaced and service checklist completed.',
  '[{"partName":"Oil Filter CFMOTO","quantity":1},{"partName":"Spark Plug","quantity":2}]',
  'demo-user-mechanic',
  CURRENT_TIMESTAMP - INTERVAL '10 days',
  CURRENT_TIMESTAMP - INTERVAL '9 days',
  CURRENT_TIMESTAMP - INTERVAL '9 days' + INTERVAL '2 hours',
  1.25,
  820,
  900,
  '/uploads/invoices/INV-PRC-DEMO-502.pdf',
  true,
  '[]'
),
(
  'demo-gop-003',
  'PRC-DEMO-503',
  'demo-veh-004',
  null,
  'ASSEMBLY',
  'PENDING',
  'Customer quad build pending mechanic start.',
  '[]',
  'demo-user-mechanic',
  CURRENT_TIMESTAMP,
  null,
  null,
  null,
  0,
  50,
  null,
  false,
  '[]'
)
ON CONFLICT ("processNo") DO NOTHING;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

INSERT INTO "Notification" ("id", "title", "message", "role", "isRead")
VALUES
(
  'demo-note-admin-001',
  'New Customer Order',
  'Customer order transaction TXN-DEMO-002 is pending vehicle build.',
  'ADMIN',
  false
),
(
  'demo-note-mech-001',
  'Garage Work Assigned',
  'Garage operation PRC-DEMO-501 is assigned to you.',
  'MECHANIC',
  false
),
(
  'demo-note-mech-002',
  'Vehicle Build Request',
  'Vehicle BUILD-3001 is ready for assembly workflow.',
  'MECHANIC',
  false
),
(
  'demo-note-store-001',
  'Parts Required',
  'Assessment ASM-DEMO-1001 requires parts issuance.',
  'STORE_KEEPER',
  false
),
(
  'demo-note-store-002',
  'Low Stock Alert',
  'Drive Belt stock is below reorder level.',
  'STORE_KEEPER',
  false
);

-- ============================================================
-- QUICK CHECK QUERIES
-- ============================================================

SELECT 'User' AS table_name, COUNT(*) AS rows FROM "User"
UNION ALL SELECT 'Transaction', COUNT(*) FROM "Transaction"
UNION ALL SELECT 'Vehicle', COUNT(*) FROM "Vehicle"
UNION ALL SELECT 'InventoryItem', COUNT(*) FROM "InventoryItem"
UNION ALL SELECT 'Assessment', COUNT(*) FROM "Assessment"
UNION ALL SELECT 'GarageOperation', COUNT(*) FROM "GarageOperation"
UNION ALL SELECT 'Notification', COUNT(*) FROM "Notification";
