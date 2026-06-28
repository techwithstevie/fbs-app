import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding FBS database...')

    const customers = [
        {
            account_number: '1000000001',
            class_code: '1234',
            class_description: 'Lease w/ monitoring Commercial Burglar and Fire Alarm',
            business_name_1: 'FBS Solutions LLC',
            billing_name_1: 'FBS Solutions LLC',
            billing_address_1: '123 Main St',
            billing_address_2: 'Suite 202',
            billing_phone_1: '555-0101',
            business_phone_1: '555-0101',
            business_emails: JSON.stringify(['billing@fbssolutions.com', 'support@fbssolutions.com']),
            billing_emails: JSON.stringify(['billing@fbssolutions.com']),
            personal_emails: JSON.stringify([]),
            billing_code: '16',
            billing_description: 'Monthly billing',
            billing_amount: 125.5,
            sales_tax_rate: 8.25,
            next_billing_month: 7,
            next_billing_year: 2026,
            service_call_rate: 85.0,
            hourly_labor_rate: 95.0,
            installation_date: '2024-10-15',
            panel_model: 'Honeywell Vista 20P',
            central_station: 'CentralSecure',
            monitoring_agreement_on_file: 1,
            created_at: new Date('2024-10-15T09:00:00.000Z'),
            updated_at: new Date('2026-06-01T12:00:00.000Z')
        },
        {
            account_number: '1000000002',
            class_code: '2235',
            class_description: 'Lease w/ monitoring Residential Burglary Alarm Only',
            first_name_1: 'Emma',
            last_name_1: 'Hart',
            billing_name_1: 'Emma Hart',
            billing_address_1: '456 Oak Avenue',
            billing_phone_1: '555-0202',
            business_phone_1: '555-0202',
            business_emails: JSON.stringify(['emma.hart@example.com']),
            billing_emails: JSON.stringify(['emma.hart@example.com']),
            personal_emails: JSON.stringify(['emma.personal@example.com']),
            billing_code: '1',
            billing_description: 'Annually in January',
            billing_amount: 280.0,
            sales_tax_rate: 0,
            next_billing_month: 1,
            next_billing_year: 2027,
            service_call_rate: 80.0,
            hourly_labor_rate: 90.0,
            installation_date: '2022-05-25',
            panel_model: 'DSC PowerSeries',
            central_station: 'HomeGuard',
            monitoring_agreement_on_file: 1,
            created_at: new Date('2022-05-25T11:30:00.000Z'),
            updated_at: new Date('2026-06-02T10:15:00.000Z')
        },
        {
            account_number: '1000000003',
            class_code: '3346',
            class_description: 'Service Only Municipal/Government Integrated System',
            business_name_1: 'Riverside School District',
            billing_name_1: 'Riverside School District',
            billing_address_1: '789 Riverside Dr',
            billing_phone_1: '555-0303',
            business_phone_1: '555-0303',
            business_emails: JSON.stringify(['admin@riversideschools.gov']),
            billing_emails: JSON.stringify(['accounts@riversideschools.gov']),
            personal_emails: JSON.stringify([]),
            billing_code: '16',
            billing_description: 'Monthly billing',
            billing_amount: 650.0,
            sales_tax_rate: 7.5,
            next_billing_month: 7,
            next_billing_year: 2026,
            service_call_rate: 110.0,
            hourly_labor_rate: 120.0,
            installation_date: '2020-08-12',
            panel_model: 'GE Interlogix',
            central_station: 'MunicipalSecure',
            monitoring_agreement_on_file: 0,
            created_at: new Date('2020-08-12T08:45:00.000Z'),
            updated_at: new Date('2026-06-03T14:20:00.000Z')
        }
    ]

    for (const customer of customers) {
        await prisma.customer.upsert({
            where: { account_number: customer.account_number },
            update: customer,
            create: customer
        })
    }

    const invoices = [
        {
            invoice_number: 'INV-202606001',
            account_number: '1000000001',
            date: '2026-06-05',
            description: 'Monthly monitoring service',
            amount: 125.5,
            invoice_type: 'monitoring',
            tax_exempt: 0,
            sales_tax_rate: 8.25,
            sales_tax_amount: 10.35,
            total_amount: 135.85,
            status: 'pending',
            due_date: new Date('2026-06-20'),
            created_at: new Date('2026-06-05T09:00:00.000Z')
        },
        {
            invoice_number: 'INV-202606002',
            account_number: '1000000002',
            date: '2026-01-10',
            description: 'Annual system maintenance',
            amount: 280.0,
            invoice_type: 'service',
            tax_exempt: 1,
            sales_tax_rate: 0,
            sales_tax_amount: 0,
            total_amount: 280.0,
            status: 'paid',
            due_date: new Date('2026-01-25'),
            paid_date: new Date('2026-01-22'),
            created_at: new Date('2026-01-10T10:15:00.000Z')
        }
    ]

    for (const invoice of invoices) {
        await prisma.invoice.upsert({
            where: { invoice_number: invoice.invoice_number },
            update: invoice,
            create: invoice
        })
    }

    const payments = [
        {
            payment_number: 'PAY-202601001',
            account_number: '1000000002',
            date: '2026-01-22',
            check_number: '2721',
            deposit_date: '2026-01-23',
            invoice_number: 'INV-202606002',
            amount: 280.0,
            payment_type: 'check',
            created_at: new Date('2026-01-22T14:30:00.000Z')
        }
    ]

    for (const payment of payments) {
        await prisma.payment.upsert({
            where: { payment_number: payment.payment_number },
            update: payment,
            create: payment
        })
    }

    const serviceCalls = [
        {
            service_call_number: 'SC-202606001',
            account_number: '1000000001',
            date: '2026-06-10',
            special_message: 'Routine alarm system inspection',
            issue_code: 'A101',
            issue_description: 'Zone 2 false alarm',
            custom_problem: 'Reset alarm panel and retest sensors',
            notes: 'Customer requested monthly maintenance check.',
            labor_hours: 1.5,
            labor_rate: 85.0,
            labor_amount: 127.5,
            parts_cost: 25.0,
            total_amount: 152.5,
            completed: 1,
            created_at: new Date('2026-06-10T13:00:00.000Z')
        }
    ]

    for (const serviceCall of serviceCalls) {
        await prisma.serviceCall.upsert({
            where: { service_call_number: serviceCall.service_call_number },
            update: serviceCall,
            create: serviceCall
        })
    }

    const estimates = [
        {
            estimate_number: 'EST-202606001',
            account_number: '1000000003',
            date: '2026-06-12',
            description: 'Integrated access control upgrade',
            items: JSON.stringify([
                { description: 'New access control panel', qty: 1, unitPrice: 950.0 },
                { description: 'Door reader replacement', qty: 4, unitPrice: 125.0 },
                { description: 'Installation labor', qty: 8, unitPrice: 95.0 }
            ]),
            subtotal: 1850.0,
            tax_amount: 138.75,
            total_amount: 1988.75,
            status: 'pending',
            valid_until: new Date('2026-07-12T00:00:00.000Z'),
            created_at: new Date('2026-06-12T09:45:00.000Z')
        }
    ]

    for (const estimate of estimates) {
        await prisma.estimate.upsert({
            where: { estimate_number: estimate.estimate_number },
            update: estimate,
            create: estimate
        })
    }

    console.log('Database seeding complete.')
}

main()
    .catch((error) => {
        console.error('Seed script failed:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
