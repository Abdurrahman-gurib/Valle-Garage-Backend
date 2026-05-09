-- ============================================================
-- Vallé Garage Demo Seed - SAFE VERSION
-- Database: valle_garage
-- ============================================================

-- Clean demo data in correct child-to-parent order
DELETE FROM "Notification" WHERE "id" LIKE 'demo-%';
DELETE FROM "GarageOperation" WHERE "processNo" LIKE 'PRC-DEMO-%';
DELETE FROM "Assessment" WHERE "ticketNo" LIKE 'ASM-DEMO-%';
DELETE FROM "Vehicle" WHERE "plateNumber" IN ('CFM-1042', 'BUG-2201', 'EXT-7788', 'BUILD-3001');
DELETE FROM "Transaction" WHERE "transactionNo" LIKE 'TXN-DEMO-%';
DELETE FROM "InventoryItem" WHERE "sku" LIKE 'CF-%';

-- Keep existing users if they already exist, update them instead
INSERT INTO "User" (
  "id", "name", "email", "passwordHash", "role",
  "isActive", "createdAt", "updatedAt"
)
VALUES
(
  gen_random_uuid()::TEXT,
  'Admin User',
  'admin@valle.com',
  '$2b$10$9Pp.WZbJf0xP8oM2nsAp7OCfVcw1dcdNTPcqILaWUgDaUuVHg1M8u',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
  'Jean Marc Mechanic',
  'mechanic@valle.com',
  '$2b$10$wkUvKwYz9L3cUbxfrlB1EunaVLMaDmrYAsgRtNSUiKrBT47fwjySK',
  'MECHANIC',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
  'CFMOTO Store Keeper',
  'store@valle.com',
  '$2b$10$rmKlyV0f8.nGaM1YgEPtM.GWOO3jkVz6XNEnYUXUGvZR3.qBV28Bu',
  'STORE_KEEPER',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "passwordHash" = EXCLUDED."passwordHash",
  "role" = EXCLUDED."role",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Transactions
INSERT INTO "Transaction" (
  "id", "transactionNo", "type", "status", "title",
  "supplierName", "supplierEmail", "customerName",
  "startDate", "expectedDeliveryDate", "poNumber",
  "poAttachmentUrl", "invoiceAttachmentUrl", "grnAttachmentUrl",
  "grnData", "amount", "notes", "createdById",
  "createdAt", "updatedAt"
)
VALUES
(
  gen_random_uuid()::TEXT,
  'TXN-DEMO-001',
  'PART_PURCHASE',
  'IN_PROGRESS',
  'Reorder CFMOTO Service Parts',
  'CFMOTO Mauritius Supplier',
  'supplier@example.com',
  NULL,
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  CURRENT_TIMESTAMP + INTERVAL '10 days',
  'PO-DEMO-001',
  '/uploads/po/PO-DEMO-001.pdf',
  NULL,
  NULL,
  NULL,
  78500.00,
  'Demo parts reorder transaction for low-stock items.',
  (SELECT "id" FROM "User" WHERE "email" = 'admin@valle.com' LIMIT 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
  'TXN-DEMO-002',
  'VEHICLE_ORDER',
  'PENDING',
  'Customer Order - Quad Assembly',
  NULL,
  NULL,
  'Adventure Client Ltd',
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  CURRENT_TIMESTAMP + INTERVAL '21 days',
  'CUSTOMER-PO-DEMO-002',
  '/uploads/po/CUSTOMER-PO-DEMO-002.pdf',
  NULL,
  NULL,
  NULL,
  450000.00,
  'Demo customer PO for a new quad build.',
  (SELECT "id" FROM "User" WHERE "email" = 'admin@valle.com' LIMIT 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
  'TXN-DEMO-003',
  'SERVICE_INVOICE',
  'PAID',
  'Repair Invoice - Buggy Service',
  NULL,
  NULL,
  'Walk-in Customer',
  CURRENT_TIMESTAMP - INTERVAL '8 days',
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  NULL,
  NULL,
  '/uploads/invoices/INV-DEMO-003.pdf',
  '/uploads/grn/GRN-DEMO-003.pdf',
  '{"receivedBy":"CFMOTO Store Keeper","receivedDate":"2026-05-09","remarks":"Demo GRN saved for completed transaction"}',
  12500.00,
  'Demo paid service invoice transaction.',
  (SELECT "id" FROM "User" WHERE "email" = 'admin@valle.com' LIMIT 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("transactionNo") DO UPDATE SET
  "status" = EXCLUDED."status",
  "title" = EXCLUDED."title",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Vehicles
INSERT INTO "Vehicle" (
  "id", "plateNumber", "vin", "vehicleType", "ownership",
  "ownerName", "companyName", "deliveryPersonName",
  "contactNumber", "email", "manufacturer", "status",
  "currentHourMeter", "checkInDateTime", "expectedDeliveryDate",
  "notes", "createdById", "transactionId", "createdAt", "updatedAt"
)
VALUES
(
  gen_random_uuid()::TEXT,
  'CFM-1042',
  'LCELV1Z42P6001042',
  'Quad',
  'INTERNAL',
  'Vallé Internal Fleet',
  NULL,
  NULL,
  NULL,
  NULL,
  'CFMOTO',
  'UNDER_REPAIR',
  1180,
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  CURRENT_TIMESTAMP + INTERVAL '4 days',
  'Brake issue reported after trail ride.',
  (SELECT "id" FROM "User" WHERE "email" = 'admin@valle.com' LIMIT 1),
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
  'BUG-2201',
  'BUGGY-VIN-2201',
  'Buggy',
  'INTERNAL',
  'Vallé Internal Fleet',
  NULL,
  NULL,
  NULL,
  NULL,
  'CFMOTO',
  'ACTIVE',
  820,
  NULL,
  NULL,
  'Ready for operation.',
  (SELECT "id" FROM "User" WHERE "email" = 'admin@valle.com' LIMIT 1),
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
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
  (SELECT "id" FROM "User" WHERE "email" = 'mechanic@valle.com' LIMIT 1),
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
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
  (SELECT "id" FROM "User" WHERE "email" = 'admin@valle.com' LIMIT 1),
  (SELECT "id" FROM "Transaction" WHERE "transactionNo" = 'TXN-DEMO-002' LIMIT 1),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("plateNumber") DO UPDATE SET
  "status" = EXCLUDED."status",
  "notes" = EXCLUDED."notes",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Inventory
INSERT INTO "InventoryItem" (
  "id", "sku", "name", "category", "barcode",
  "currentStock", "reorderLevel", "costPrice", "sellingPrice",
  "supplierName", "supplierEmail", "location",
  "createdAt", "updatedAt"
)
VALUES
(gen_random_uuid()::TEXT, 'CF-OIL-221', 'Oil Filter CFMOTO', 'Service Parts', '889102210', 7, 10, 250.00, 450.00, 'CFMOTO Mauritius Supplier', 'supplier@example.com', 'Shelf A1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid()::TEXT, 'CF-BRK-110', 'Brake Pad Set', 'Brake System', '889100110', 34, 12, 850.00, 1250.00, 'CFMOTO Mauritius Supplier', 'supplier@example.com', 'Brake Bay', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid()::TEXT, 'CF-BLT-501', 'Drive Belt', 'Transmission', '889105501', 4, 8, 2600.00, 3800.00, 'CFMOTO Mauritius Supplier', 'supplier@example.com', 'Shelf B2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid()::TEXT, 'CF-SPK-330', 'Spark Plug', 'Engine Parts', '889103330', 58, 20, 150.00, 290.00, 'CFMOTO Mauritius Supplier', 'supplier@example.com', 'Shelf C1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("sku") DO UPDATE SET
  "currentStock" = EXCLUDED."currentStock",
  "reorderLevel" = EXCLUDED."reorderLevel",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Assessments
INSERT INTO "Assessment" (
  "id", "ticketNo", "vehicleId", "mechanicId", "status",
  "issuesDetected", "conclusion", "requiredParts",
  "reopenReason", "reopenedById", "reopenedAt", "photos",
  "createdAt", "updatedAt"
)
VALUES
(
  gen_random_uuid()::TEXT,
  'ASM-DEMO-1001',
  (SELECT "id" FROM "Vehicle" WHERE "plateNumber" = 'CFM-1042' LIMIT 1),
  (SELECT "id" FROM "User" WHERE "email" = 'mechanic@valle.com' LIMIT 1),
  'READY_FOR_PARTS',
  'Brake noise and weak stopping response.',
  'Replace brake pads and inspect brake fluid.',
  '[{"partName":"Brake Pad Set","quantity":2},{"partName":"Oil Filter CFMOTO","quantity":1}]',
  NULL,
  NULL,
  NULL,
  '[]',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
  'ASM-DEMO-1002',
  (SELECT "id" FROM "Vehicle" WHERE "plateNumber" = 'BUG-2201' LIMIT 1),
  (SELECT "id" FROM "User" WHERE "email" = 'mechanic@valle.com' LIMIT 1),
  'COMPLETED',
  'Routine service due.',
  'Oil filter replaced and service completed.',
  '[{"partName":"Oil Filter CFMOTO","quantity":1},{"partName":"Spark Plug","quantity":2}]',
  NULL,
  NULL,
  NULL,
  '[]',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
  'ASM-DEMO-1003',
  (SELECT "id" FROM "Vehicle" WHERE "plateNumber" = 'EXT-7788' LIMIT 1),
  (SELECT "id" FROM "User" WHERE "email" = 'mechanic@valle.com' LIMIT 1),
  'REOPENED',
  'Engine vibration under load.',
  'Additional belt inspection required.',
  '[{"partName":"Drive Belt","quantity":1}]',
  'Mechanic found extra belt wear after initial inspection.',
  (SELECT "id" FROM "User" WHERE "email" = 'mechanic@valle.com' LIMIT 1),
  CURRENT_TIMESTAMP - INTERVAL '3 hours',
  '[]',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("ticketNo") DO UPDATE SET
  "status" = EXCLUDED."status",
  "issuesDetected" = EXCLUDED."issuesDetected",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Garage Operations
INSERT INTO "GarageOperation" (
  "id", "processNo", "vehicleId", "assessmentId",
  "processType", "status", "proceduresPerformed", "partsUsed",
  "mechanicId", "checkInDateTime", "startDateTime", "endDateTime",
  "laborHours", "currentHourMeter", "nextServiceDueAtHours",
  "invoiceAttachmentUrl", "paymentDone", "photos",
  "createdAt", "updatedAt"
)
VALUES
(
  gen_random_uuid()::TEXT,
  'PRC-DEMO-501',
  (SELECT "id" FROM "Vehicle" WHERE "plateNumber" = 'CFM-1042' LIMIT 1),
  (SELECT "id" FROM "Assessment" WHERE "ticketNo" = 'ASM-DEMO-1001' LIMIT 1),
  'REPAIR',
  'IN_PROGRESS',
  'Inspecting brake system and preparing replacement.',
  '[{"partName":"Brake Pad Set","quantity":2}]',
  (SELECT "id" FROM "User" WHERE "email" = 'mechanic@valle.com' LIMIT 1),
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  NULL,
  2.50,
  1180,
  1250,
  NULL,
  false,
  '[]',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
  'PRC-DEMO-502',
  (SELECT "id" FROM "Vehicle" WHERE "plateNumber" = 'BUG-2201' LIMIT 1),
  (SELECT "id" FROM "Assessment" WHERE "ticketNo" = 'ASM-DEMO-1002' LIMIT 1),
  'SERVICING',
  'COMPLETED',
  'Oil filter replaced and service checklist completed.',
  '[{"partName":"Oil Filter CFMOTO","quantity":1},{"partName":"Spark Plug","quantity":2}]',
  (SELECT "id" FROM "User" WHERE "email" = 'mechanic@valle.com' LIMIT 1),
  CURRENT_TIMESTAMP - INTERVAL '10 days',
  CURRENT_TIMESTAMP - INTERVAL '9 days',
  CURRENT_TIMESTAMP - INTERVAL '9 days' + INTERVAL '2 hours',
  1.25,
  820,
  900,
  '/uploads/invoices/INV-PRC-DEMO-502.pdf',
  true,
  '[]',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid()::TEXT,
  'PRC-DEMO-503',
  (SELECT "id" FROM "Vehicle" WHERE "plateNumber" = 'BUILD-3001' LIMIT 1),
  NULL,
  'ASSEMBLY',
  'PENDING',
  'Customer quad build pending mechanic start.',
  '[]',
  (SELECT "id" FROM "User" WHERE "email" = 'mechanic@valle.com' LIMIT 1),
  CURRENT_TIMESTAMP,
  NULL,
  NULL,
  NULL,
  0,
  50,
  NULL,
  false,
  '[]',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("processNo") DO UPDATE SET
  "status" = EXCLUDED."status",
  "proceduresPerformed" = EXCLUDED."proceduresPerformed",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Notifications
INSERT INTO "Notification" (
  "id", "title", "message", "role", "isRead", "createdAt"
)
VALUES
(gen_random_uuid()::TEXT, 'New Customer Order', 'Customer order transaction TXN-DEMO-002 is pending vehicle build.', 'ADMIN', false, CURRENT_TIMESTAMP),
(gen_random_uuid()::TEXT, 'Garage Work Assigned', 'Garage operation PRC-DEMO-501 is assigned to you.', 'MECHANIC', false, CURRENT_TIMESTAMP),
(gen_random_uuid()::TEXT, 'Vehicle Build Request', 'Vehicle BUILD-3001 is ready for assembly workflow.', 'MECHANIC', false, CURRENT_TIMESTAMP),
(gen_random_uuid()::TEXT, 'Parts Required', 'Assessment ASM-DEMO-1001 requires parts issuance.', 'STORE_KEEPER', false, CURRENT_TIMESTAMP),
(gen_random_uuid()::TEXT, 'Low Stock Alert', 'Drive Belt stock is below reorder level.', 'STORE_KEEPER', false, CURRENT_TIMESTAMP);

-- Check counts
SELECT 'User' AS table_name, COUNT(*) AS rows FROM "User"
UNION ALL SELECT 'Transaction', COUNT(*) FROM "Transaction"
UNION ALL SELECT 'Vehicle', COUNT(*) FROM "Vehicle"
UNION ALL SELECT 'InventoryItem', COUNT(*) FROM "InventoryItem"
UNION ALL SELECT 'Assessment', COUNT(*) FROM "Assessment"
UNION ALL SELECT 'GarageOperation', COUNT(*) FROM "GarageOperation"
UNION ALL SELECT 'Notification', COUNT(*) FROM "Notification";