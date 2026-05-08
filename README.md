# Vallé GMS Backend
## NestJS + PostgreSQL + Prisma API

Production-ready backend starter for the Vallé Garage & Spare Parts Management frontend.

## Included
- NestJS API
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Role guards: Admin, Mechanic, Store Keeper
- Vehicles, assessments, garage operations, inventory, transactions, reports and notifications
- Prisma seed data and raw SQL database file

## Requirements
Install:
- Node.js 18+
- PostgreSQL 14+
- npm

## 1. Create PostgreSQL database
Open PowerShell:

```powershell
psql -U postgres
```

Inside psql:

```sql
CREATE DATABASE valle_gms;
\q
```

## 2. Configure `.env`

```powershell
copy .env.example .env
notepad .env
```

Update your PostgreSQL password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/valle_gms?schema=public"
JWT_SECRET="change_this_secret_before_production"
JWT_EXPIRES_IN="1d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

## 3. Install packages

```powershell
npm install
```

## 4. Create tables and seed data

```powershell
npx prisma generate
npx prisma db push
npm run db:seed
```

## 5. Run API

```powershell
npm run start:dev
```

API runs at:

```txt
http://localhost:3000/api
```

## Demo login credentials

```txt
admin@valle.com / password123
mechanic@valle.com / password123
store@valle.com / password123
```

## Connect frontend
In frontend `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Main endpoints

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`

### Vehicles
- `GET /api/vehicles`
- `GET /api/vehicles/:id`
- `POST /api/vehicles`
- `PATCH /api/vehicles/:id`

### Assessments
- `GET /api/assessments`
- `POST /api/assessments`
- `POST /api/assessments/:id/reopen`
- `POST /api/assessments/:id/issue-parts`
- `POST /api/assessments/:id/complete`

### Inventory
- `GET /api/inventory`
- `GET /api/inventory/low-stock`
- `POST /api/inventory`
- `PATCH /api/inventory/:id`

### Garage Ops
- `GET /api/garage-ops`
- `POST /api/garage-ops`
- `PATCH /api/garage-ops/:id`

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `PATCH /api/transactions/:id`
- `POST /api/transactions/:id/complete-with-grn`

### Reports and notifications
- `GET /api/reports/dashboard`
- `GET /api/reports/maintenance-history`
- `GET /api/notifications`

## Production build

```powershell
npm run build
npm run start:prod
```

For a local server without Docker, use PM2:

```powershell
npm install -g pm2
npm run build
pm2 start dist/main.js --name valle-gms-api
pm2 save
```

## Database viewer

```powershell
npx prisma studio
```
