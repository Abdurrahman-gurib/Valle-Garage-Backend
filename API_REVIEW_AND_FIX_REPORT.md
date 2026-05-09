# Vallé GMS Backend API Review and Fix Report

## Scope

The uploaded NestJS + Prisma + PostgreSQL backend was reviewed and amended for compatibility with the Vallé Garage frontend workflows.

The test coverage targets:

- Login/authentication
- JWT protected routes
- Role-based access control
- Admin, Mechanic and Store Keeper flows
- Transactions / purchase orders
- Customer-order vehicle creation
- Assessment creation, reopening, parts issue and completion
- Garage operation creation and update
- Inventory and low-stock flow
- Reports and notifications

## Fixes Applied

### 1. Prisma version pinned

`package.json` now pins Prisma packages to `5.22.0` instead of using loose caret versions.

This prevents accidental Prisma 7 installation, which breaks the existing `schema.prisma` datasource syntax.

Updated packages:

```json
"prisma": "5.22.0",
"@prisma/client": "5.22.0"
```

### 2. Frontend-compatible seed credentials

The backend seed now matches the frontend login roles:

| Role | Email | Password |
|---|---|---|
| Admin | admin@valle.com | admin123 |
| Mechanic | mechanic@valle.com | mech123 |
| Store Keeper | store@valle.com | store123 |

### 3. Auth email normalization

Login now trims and lowercases email before database lookup.

### 4. Role validation improved

The login role check now uses the shared `normalizeRole()` helper, supporting frontend role values:

- `admin` → `ADMIN`
- `mechanic` → `MECHANIC`
- `store` → `STORE_KEEPER`

### 5. Inventory payload normalization

Inventory create/update now accepts both frontend-friendly and backend field names:

- `stock` or `currentStock`
- string or numeric stock values
- string or numeric prices

### 6. Assessment creation made safer

Assessment creation now provides a fallback value for `issuesDetected` if the frontend sends `issue` or leaves it blank.

### 7. PostgreSQL SQL seed improved

The SQL database file now uses `pgcrypto` to generate bcrypt-compatible password hashes during import:

```sql
crypt('admin123', gen_salt('bf'))
```

## Main Payloads Used by the Bot

### Login

```json
{
  "email": "admin@valle.com",
  "password": "admin123",
  "role": "admin"
}
```

### Create Transaction / Purchase Order

```json
{
  "transactionNo": "TXN-API-<run_id>",
  "type": "Vehicle Order",
  "status": "In Progress",
  "title": "API Customer Quad Build <run_id>",
  "customerName": "API Test Customer Ltd",
  "poNumber": "PO-API-<run_id>",
  "poAttachmentUrl": "/uploads/po-<run_id>.pdf",
  "amount": 485000,
  "startDate": "<ISO_DATE>",
  "expectedDeliveryDate": "<ISO_DATE>",
  "notes": "Created by API Test Bot."
}
```

### Create Vehicle

```json
{
  "plateNumber": "API-<unique>",
  "vin": "VIN-API-<run_id>",
  "vehicleType": "Quad",
  "ownership": "Customer Order",
  "ownerName": "API Test Customer Ltd",
  "companyName": "API Test Customer Ltd",
  "deliveryPersonName": "QA Delivery Person",
  "contactNumber": "+230 5123 4567",
  "email": "qa.customer@example.com",
  "manufacturer": "CFMOTO",
  "status": "Build in Progress",
  "currentHourMeter": 0,
  "checkInDateTime": "<ISO_DATE>",
  "expectedDeliveryDate": "<ISO_DATE>",
  "transactionId": "<created_transaction_id>",
  "notes": "Vehicle created by API Test Bot from PO flow."
}
```

### Create Assessment

```json
{
  "ticketNo": "ASM-API-<run_id>",
  "vehicleId": "<created_vehicle_id>",
  "status": "OPEN",
  "issuesDetected": "Assembly inspection found missing side mirror and brake adjustment requirement.",
  "conclusion": "Request parts before final testing.",
  "requiredParts": [
    { "partName": "Side Mirror Set", "quantity": 1 },
    { "partName": "Brake Adjustment Kit", "quantity": 1 }
  ],
  "photos": ["/uploads/assessment-<run_id>.jpg"]
}
```

### Issue Parts

```json
{
  "parts": [
    { "partName": "Side Mirror Set", "quantity": 1, "issuedBy": "Store Keeper" },
    { "partName": "Brake Adjustment Kit", "quantity": 1, "issuedBy": "Store Keeper" }
  ]
}
```

### Create Garage Operation

```json
{
  "processNo": "PRC-API-<run_id>",
  "vehicleId": "<created_vehicle_id>",
  "assessmentId": "<created_assessment_id>",
  "processType": "Build / Assembly",
  "status": "In Progress",
  "proceduresPerformed": "Started vehicle assembly and pre-delivery mechanical checks.",
  "partsUsed": [{ "partName": "Side Mirror Set", "quantity": 1 }],
  "checkInDateTime": "<ISO_DATE>",
  "startDateTime": "<ISO_DATE>",
  "laborHours": 1.5,
  "currentHourMeter": 0,
  "nextServiceDueAtHours": 100,
  "photos": ["/uploads/garage-<run_id>.jpg"]
}
```

## How to Know If Everything Works

Run:

```powershell
python tools/api_test_bot.py --base-url http://localhost:3000/api
```

If all API tests pass, the last line will be:

```txt
All tests passed.
```

A detailed Markdown report will be created under:

```txt
test-results/
```

## Note

The generated bot must be run on your own machine because it needs access to your local PostgreSQL database and running NestJS backend. The package includes everything required for you to run the test locally.
