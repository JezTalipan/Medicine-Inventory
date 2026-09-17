# Jez Meds

Medicine inventory system — an ASP.NET Core API backed by SQL Server, with a React dashboard and
CRUD front end.

## What's in here

| Path | What it is |
| --- | --- |
| `database/` | SQL Server scripts: create database, create tables, seed sample data |
| `MedicineInventory.Api/` | ASP.NET Core 10 Web API (auth, medicines, sales, dashboard, reports) |
| `Medicine Inventory/` | React 19 + Rsbuild + Ant Design front end |

## Features

- **Login** — JWT auth against a `Users` table with bcrypt-hashed passwords
- **Dashboard** — summary cards plus Recharts visuals for sales over time, stock levels, and
  top-selling medicines
- **Medicines** — full CRUD table with name, generic name, category, quantity, unit price, stock
  value, units sold, expiry, and supplier; low stock and expired items are flagged
- **Sales** — record a sale from any row; stock decrements and the dashboard updates
- **Reports** — download an Excel workbook (Medicines + Sales sheets)

## Getting started

### 1. Database

Run the scripts in `database/` in order against your local SQL Server. See
[`database/README.md`](database/README.md) for details and connection-string options.

```bash
sqlcmd -S localhost -i database/01_create_database.sql
sqlcmd -S localhost -i database/02_create_tables.sql
sqlcmd -S localhost -i database/03_seed.sql
```

If your instance isn't `localhost` with Windows auth, create
`MedicineInventory.Api/appsettings.Local.json` (gitignored) with your own connection string.

### 2. API

```bash
cd MedicineInventory.Api
dotnet restore
dotnet run --launch-profile http
```

Runs on <http://localhost:5029>, with Swagger UI at <http://localhost:5029/swagger>. Log in through
`/api/auth/login`, then use the **Authorize** button to call the protected endpoints.

### 3. Front end

```bash
cd "Medicine Inventory"
npm install
npm run dev
```

Runs on <http://localhost:3000>. The API base URL comes from `PUBLIC_API_URL` in `.env`.

### Default login

`admin` / `admin123`

## API endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Sign in, returns a JWT |
| GET | `/api/medicines` | List medicines with units sold and revenue |
| GET | `/api/medicines/{id}` | Fetch one medicine |
| POST | `/api/medicines` | Create a medicine |
| PUT | `/api/medicines/{id}` | Update a medicine |
| DELETE | `/api/medicines/{id}` | Delete a medicine and its sales |
| GET | `/api/sales` | Recent sales |
| POST | `/api/sales` | Record a sale and decrement stock |
| GET | `/api/dashboard/summary` | Totals and chart data |
| GET | `/api/reports/medicines` | Excel report download |

Every endpoint except login requires an `Authorization: Bearer <token>` header.
`MedicineInventory.Api.http` has ready-made requests for each one.

## Notes

- The SQL scripts are the source of truth for the schema; EF Core maps to them and there are no
  migrations. Change the scripts first.
- Change the `Jwt:Key` in `appsettings.json` (or override it in `appsettings.Local.json`) before
  deploying anywhere real. It must be at least 32 characters.
