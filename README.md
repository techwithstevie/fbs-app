# FBS - Fire/Burglar Security Management Application

A comprehensive business management application for fire and burglar security companies, featuring customer management, billing, invoicing, service calls, reporting, and form generation.

## Features

- **Customer Management**: Complete customer records with class codes, business information, billing details, and system specifications
- **Class Code System**: 4-digit class codes with automatic description generation (Status, Type, System Type)
- **Billing Management**: Multiple billing codes (annual, quarterly, monthly, semi-annual) with tax exemption support
- **Invoicing**: Generate invoices, track outstanding balances, automatic monthly billing generation
- **Payment Processing**: Post payments with check tracking and automatic invoice status updates
- **Service Calls**: Log service calls with issue codes, labor hours, parts cost, and automatic rate calculation
- **Reports**: Accounts receivable, aging reports, customer lists by various criteria, past due reports
- **Statements**: Generate customer statements with aging buckets and interest calculations
- **Forms**: Generate installation certificates, monitoring certificates, inspection forms, estimates
- **Scheduling**: Reminder system for inspections, service calls, and renewals

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with Prisma ORM
- **Runtime**: Bun
- **UI Components**: Custom components with Tailwind CSS styling

## Prerequisites

- Bun runtime
- Node.js 18+ (for some dependencies)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fbs-app
```

2. Install dependencies:
```bash
bun install
cd server && bun install
cd ../client && bun install
```

3. Set up the database with Prisma:
```bash
cd server

# Generate Prisma Client
bun run prisma:generate

# Run migrations to create the database
bun run prisma:migrate

# The SQLite database will be created at server/database/fbs_app.db
```

4. Configure environment variables:
```bash
# Copy the example env file
cp server/.env.example server/.env

# Edit server/.env if needed (only PORT and JWT_SECRET are required)
```

5. Start the application:
```bash
# From the root directory
bun run dev
```

This will start both the frontend (port 3000) and backend (port 5000) servers.

## Database Schema

The application uses Prisma ORM with SQLite. The schema is defined in `server/prisma/schema.prisma` with the following main models:
- `Customer` - Customer account information
- `Invoice` - Invoice records
- `Payment` - Payment records
- `ServiceCall` - Service call records
- `Estimate` - Estimate records

## Database Location

The SQLite database file is located at `server/database/fbs_app.db`. This file is created automatically by Prisma. To back up your data, simply copy this file.

## Prisma Commands

```bash
cd server

# View and edit the database schema
bun run prisma:studio

# Generate Prisma Client after schema changes
bun run prisma:generate

# Create and run migrations
bun run prisma:migrate

# Reset the database (WARNING: deletes all data)
bunx prisma migrate reset
```

## Class Code Structure

The 4-digit class code represents:
- **Position 1**: Status (Lease, Monitoring, Service, FBS types)
- **Position 2**: Type (Commercial, Residential, Municipal, Billing)
- **Position 3**: System Type (Burglar/Fire, Burglar Only, Fire, Access Control, etc.)
- **Position 4**: Reserved

Example: `1234` = Lease w/ monitoring, Commercial, Burglar and Fire Alarm

## Billing Codes

- `1-12`: Annually in specified month
- `13-15`: Quarterly (different month combinations)
- `16`: Monthly
- `41-46`: Semi-annually
- `77`: Billed on other account
- `88`: Billed monthly on credit card
- `99`: Free - No charge
- Add 20 to any code for tax exemption (e.g., `21` = Annual January, tax exempt)

## Development

### Running the Backend

```bash
cd server
bun run dev
```

The backend runs on port 5000 by default.

### Running the Frontend

```bash
cd client
bun run dev
```

The frontend runs on port 3000 by default.

### Building for Production

```bash
# Build backend
cd server
bun run build

# Build frontend
cd client
bun run build
```

### Type Checking

```bash
# Check backend TypeScript
cd server
npx tsc --noEmit

# Check frontend TypeScript
cd client
npx tsc --noEmit
```

## API Endpoints

### Customers
- `GET /api/customers` - List customers with search
- `GET /api/customers/:accountNumber` - Get customer by account number
- `GET /api/customers/next-account-number/available` - Get next available account number
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:accountNumber` - Update customer
- `DELETE /api/customers/:accountNumber` - Delete customer

### Accounts
- `GET /api/accounts/class-code/description?code=1234` - Get class code description
- `GET /api/accounts/billing-code/description?code=16` - Get billing code description
- `POST /api/accounts/update-billing` - Update billing amounts for multiple accounts
- `POST /api/accounts/update-tax-rate` - Update sales tax rate

### Invoices
- `GET /api/invoices` - List invoices with filters
- `GET /api/invoices/:invoiceNumber` - Get invoice by number
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:invoiceNumber/status` - Update invoice status
- `POST /api/invoices/generate-monthly` - Generate monthly billing invoices

### Payments
- `GET /api/payments` - List payments with filters
- `POST /api/payments` - Create payment
- `GET /api/payments/:paymentNumber` - Get payment by number

### Service Calls
- `GET /api/service-calls` - List service calls
- `POST /api/service-calls` - Create service call
- `PUT /api/service-calls/:serviceCallNumber` - Update service call

### Reports
- `GET /api/reports/accounts-receivable` - Accounts receivable report
- `GET /api/reports/statement/:accountNumber` - Customer statement
- `GET /api/reports/customers/by-billing-code` - Customers by billing code
- `GET /api/reports/customers/by-class-code` - Customers by class code
- `GET /api/reports/customers/by-zip` - Customers by zip code
- `GET /api/reports/past-due` - Past due accounts

## Usage

### Adding a Customer
1. Database Location

The SQLite database file is located at `server/database/fbs_app.db`. This file is created automatically on first run. To back up your data, simply copy this file.

## Navigate to Customers → Add Customer
2. Fill in the account information (account number auto-generated)
3. Enter the 4-digit class code (description auto-generates)
4. Complete business, personal, billing, and system information
5. Save the customer record

### Creating an Invoice
1. Navigate to Invoices → Create Invoice
2. Enter account number, date, description, and amount
3. Select invoice type (service, monitoring, taxable, etc.)
4. Save the invoice

### Posting a Payment
1. Navigate to Payments → Post Payment
2. Enter account number, date, check information
3. Link to invoice if applicable
4. Enter payment type and amount
5. Post the payment (automatically updates invoice status)

### Service Calls
1. Navigate to Service Calls → New Service Call
2. Enter account number and date
3. Select issue code from predefined list
4. Enter labor hours and parts cost
5. Rates auto-populate from customer record
6. Save and mark as complete when finished

### Reports
1. Navigate to Reports
2. Select the desired report type
3. Enter any required parameters (billing code, class code, zip code, etc.)
4. View, print, download, or email the report

## Development

### Project Structure
```
fbs-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utility functions
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                # Express backend
│   ├── database/
│   │   └── schema.sql    # Database schema
│   ├── routes/           # API routes
│   ├── index.js          # Server entry point
│   └── package.json
└── package.json          # Root package.json
```

### Adding New Features
1. Add API route in `server/src/routes/`
2. Add page component in `client/src/pages/`
3. Update navigation in `client/src/components/Layout.tsx`
4. Add route in `client/src/App.tsx`

## License

Proprietary - All rights reserved
