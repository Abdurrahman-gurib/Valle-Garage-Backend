# Vallé Garage Backend

NestJS + Prisma + PostgreSQL backend compatible with the Vallé Garage React frontend.

## Demo logins

```txt
admin@vallepark.com / password123
mechanic@vallepark.com / password123
store@vallepark.com / password123
```

## Setup

1. Create PostgreSQL database:

```sql
CREATE DATABASE valle_garage;
```

2. Copy `.env.example` to `.env` and update your password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/valle_garage?schema=public"
JWT_SECRET="valle_garage_secret_2026_change_in_production"
JWT_EXPIRES_IN="1d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

3. Install and prepare DB:

```powershell
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run start:dev
```

API: `http://localhost:3000/api`
Swagger: `http://localhost:3000/api/docs`

## Frontend connection

In frontend `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Main endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PATCH /api/users`
- `GET/POST/PATCH /api/vehicles`
- `GET/POST/PATCH /api/assessments`
- `POST /api/assessments/:id/reopen`
- `POST /api/assessments/:id/issue-parts`
- `POST /api/assessments/:id/complete`
- `GET/POST/PATCH /api/garage-ops`
- `GET/POST/PATCH /api/inventory`
- `GET/POST/PATCH /api/transactions`
- `POST /api/transactions/:id/complete-with-grn`
- `GET /api/reports/dashboard`
- `GET /api/reports/maintenance-history`
- `GET /api/notifications`

## Manual SQL seed alternative

After `npx prisma db push`, run:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d valle_garage -f ".\database\valle_garage.sql"
```

Use your PostgreSQL version folder if not `18`.
