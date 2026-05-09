# Vallé GMS API Testing Guide

This backend now includes an advanced Python API Test Bot that works like a small Postman runner. It tests authentication, role guards, database-backed CRUD operations, workflow endpoints, reports and notifications.

## What the bot tests

The bot performs these checks against the running NestJS API and PostgreSQL database:

1. Protected route rejects requests without JWT.
2. Admin, Mechanic and Store Keeper login successfully.
3. Invalid password is rejected.
4. `/auth/me` returns the logged-in user for each role.
5. Admin-only users API works and denies mechanic access.
6. Admin can create, read and update a user.
7. Admin can create a transaction / PO.
8. Mechanic is correctly blocked from creating transactions.
9. Admin can update transaction with invoice and payment status.
10. Admin can complete a transaction with GRN data.
11. Admin can create a customer-order vehicle from a PO.
12. Store Keeper is correctly blocked from creating vehicles.
13. Mechanic can update vehicle build/delivery details.
14. Store Keeper can create and update inventory.
15. Mechanic is correctly blocked from inventory creation.
16. Mechanic can create assessments.
17. Store Keeper is correctly blocked from creating assessments.
18. Mechanic can reopen assessments with a reason.
19. Store Keeper can issue parts and complete assessments.
20. Mechanic can create and update garage operations.
21. Store Keeper is correctly blocked from creating garage operations.
22. Dashboard reports, maintenance history and notifications return successfully.

## Required setup before testing

### 1. Create the database

```powershell
psql -U postgres
```

```sql
CREATE DATABASE valle_gms;
\q
```

### 2. Configure `.env`

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/valle_gms?schema=public"
JWT_SECRET="change_this_secret_before_production"
JWT_EXPIRES_IN="1d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

If your password contains `@`, encode it as `%40`.

Example:

```env
DATABASE_URL="postgresql://postgres:Abdurrahman%402026@localhost:5432/valle_gms?schema=public"
```

### 3. Install and prepare backend

```powershell
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Start backend

```powershell
npm run start:dev
```

API should be running on:

```txt
http://localhost:3000/api
```

## Run the Python API Test Bot

Open a second PowerShell terminal in the backend folder:

```powershell
python tools/api_test_bot.py --base-url http://localhost:3000/api
```

The bot uses only Python standard library. No `pip install` is required.

## Generated test reports

After the run, the bot creates:

```txt
test-results/api-test-results-<run_id>.json
test-results/api-test-report-<run_id>.md
test-results/api-test-payloads-<run_id>.json
```

The Markdown report shows:

- passed / failed tests
- endpoint tested
- HTTP status expected
- HTTP status received
- payloads used
- response previews

## Demo users used by the bot

```txt
Admin:        admin@valle.com / admin123
Mechanic:     mechanic@valle.com / mech123
Store Keeper: store@valle.com / store123
```

## Important fix included

The seed file was updated to match frontend demo credentials:

- admin uses `admin123`
- mechanic uses `mech123`
- store keeper uses `store123`

The database SQL file also uses PostgreSQL `pgcrypto` to generate bcrypt hashes during import.

## Frontend connection

Frontend `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Then restart frontend:

```powershell
npm run dev
```
