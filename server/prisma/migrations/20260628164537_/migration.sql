-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "sales_tax_rate" REAL;

-- CreateTable
CREATE TABLE "Reminder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "account_number" TEXT NOT NULL,
    "reminder_type" TEXT NOT NULL,
    "due_date" TEXT NOT NULL,
    "description" TEXT,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reminder_account_number_fkey" FOREIGN KEY ("account_number") REFERENCES "Customer" ("account_number") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Reminder_account_number_idx" ON "Reminder"("account_number");
