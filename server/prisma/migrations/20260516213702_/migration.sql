-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "account_number" TEXT NOT NULL,
    "class_code" TEXT NOT NULL,
    "class_description" TEXT,
    "business_name_1" TEXT,
    "business_name_2" TEXT,
    "business_address_1" TEXT,
    "business_address_2" TEXT,
    "business_phone_1" TEXT,
    "business_phone_1_desc" TEXT,
    "business_phone_2" TEXT,
    "business_phone_2_desc" TEXT,
    "business_emails" TEXT,
    "billing_name_1" TEXT,
    "billing_name_2" TEXT,
    "billing_address_1" TEXT,
    "billing_address_2" TEXT,
    "billing_address_3" TEXT,
    "billing_phone_1" TEXT,
    "billing_phone_1_desc" TEXT,
    "billing_phone_2" TEXT,
    "billing_phone_2_desc" TEXT,
    "billing_phone_3" TEXT,
    "billing_phone_3_desc" TEXT,
    "billing_emails" TEXT,
    "last_name_1" TEXT,
    "last_name_2" TEXT,
    "first_name_1" TEXT,
    "first_name_2" TEXT,
    "contact_1_name" TEXT,
    "contact_2_name" TEXT,
    "home_phone_1" TEXT,
    "home_phone_2" TEXT,
    "cell_phone_1" TEXT,
    "cell_phone_1_desc" TEXT,
    "cell_phone_2" TEXT,
    "cell_phone_2_desc" TEXT,
    "cell_phone_3" TEXT,
    "cell_phone_3_desc" TEXT,
    "personal_emails" TEXT,
    "billing_code" TEXT,
    "billing_description" TEXT,
    "billing_amount" REAL,
    "next_billing_month" INTEGER,
    "next_billing_year" INTEGER,
    "service_call_rate" REAL,
    "hourly_labor_rate" REAL,
    "discount_percent" REAL,
    "discount_reason" TEXT,
    "installation_date" TEXT,
    "installing_company" TEXT,
    "access_codes" TEXT,
    "panel_model" TEXT,
    "panel_location" TEXT,
    "transformer_location" TEXT,
    "panel_codes" TEXT,
    "panel_phone" TEXT,
    "zone_list" TEXT,
    "starlink_model" TEXT,
    "starlink_number" TEXT,
    "central_station" TEXT,
    "central_station_account" TEXT,
    "central_station_password" TEXT,
    "last_fire_inspection_date" TEXT,
    "last_nfpa_form_on_file" INTEGER NOT NULL DEFAULT 0,
    "last_service_date" TEXT,
    "last_service_description" TEXT,
    "custom_comments" TEXT,
    "custom_notes" TEXT,
    "monitoring_agreement_on_file" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_number" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "invoice_type" TEXT,
    "tax_exempt" INTEGER NOT NULL DEFAULT 0,
    "sales_tax_rate" REAL,
    "sales_tax_amount" REAL,
    "total_amount" REAL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" DATETIME,
    "paid_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_account_number_fkey" FOREIGN KEY ("account_number") REFERENCES "Customer" ("account_number") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payment_number" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "check_number" TEXT,
    "check_date" TEXT,
    "deposit_date" TEXT,
    "invoice_number" TEXT,
    "amount" REAL NOT NULL,
    "payment_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_account_number_fkey" FOREIGN KEY ("account_number") REFERENCES "Customer" ("account_number") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_invoice_number_fkey" FOREIGN KEY ("invoice_number") REFERENCES "Invoice" ("invoice_number") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceCall" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "service_call_number" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "special_message" TEXT,
    "issue_code" TEXT,
    "issue_description" TEXT,
    "custom_problem" TEXT,
    "notes" TEXT,
    "labor_hours" REAL,
    "labor_rate" REAL,
    "labor_amount" REAL,
    "parts_cost" REAL,
    "total_amount" REAL,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceCall_account_number_fkey" FOREIGN KEY ("account_number") REFERENCES "Customer" ("account_number") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "estimate_number" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT,
    "items" TEXT,
    "subtotal" REAL,
    "tax_amount" REAL,
    "total_amount" REAL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "valid_until" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Estimate_account_number_fkey" FOREIGN KEY ("account_number") REFERENCES "Customer" ("account_number") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_account_number_key" ON "Customer"("account_number");

-- CreateIndex
CREATE INDEX "Customer_account_number_idx" ON "Customer"("account_number");

-- CreateIndex
CREATE INDEX "Customer_class_code_idx" ON "Customer"("class_code");

-- CreateIndex
CREATE INDEX "Customer_business_name_1_idx" ON "Customer"("business_name_1");

-- CreateIndex
CREATE INDEX "Customer_billing_code_idx" ON "Customer"("billing_code");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_number_key" ON "Invoice"("invoice_number");

-- CreateIndex
CREATE INDEX "Invoice_account_number_idx" ON "Invoice"("account_number");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_payment_number_key" ON "Payment"("payment_number");

-- CreateIndex
CREATE INDEX "Payment_account_number_idx" ON "Payment"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCall_service_call_number_key" ON "ServiceCall"("service_call_number");

-- CreateIndex
CREATE INDEX "ServiceCall_account_number_idx" ON "ServiceCall"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_estimate_number_key" ON "Estimate"("estimate_number");
