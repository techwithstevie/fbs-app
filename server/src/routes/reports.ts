import { Request, Response, Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Accounts Receivable Report
router.get('/accounts-receivable', async (req: Request, res: Response) => {
  try {
    const { asOfDate } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: { status: { not: 'paid' } },
      include: {
        customer: {
          select: {
            account_number: true,
            business_name_1: true,
            last_name_1: true,
            first_name_1: true,
            billing_address_1: true
          }
        }
      },
      orderBy: [
        { account_number: 'asc' },
        { due_date: 'asc' }
      ]
    });

    // Calculate aging buckets and interest in JavaScript
    const rowsWithAging = invoices.map((inv: any) => {
      const dueDate = new Date(inv.due_date);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      let aging_bucket = '1-30';
      if (daysOverdue > 120) aging_bucket = 'over 120';
      else if (daysOverdue > 90) aging_bucket = '90-120';
      else if (daysOverdue > 60) aging_bucket = '60-90';
      else if (daysOverdue > 30) aging_bucket = '30-60';

      const interest_accrued = daysOverdue > 30 ? inv.total_amount * Math.pow(1.015, daysOverdue / 30) - inv.total_amount : 0;

      return {
        ...inv,
        customer: inv.customer,
        aging_bucket,
        interest_accrued
      };
    });

    // Group by account and calculate totals
    const accounts: Record<string, any> = {};
    rowsWithAging.forEach((row: any) => {
      const accountNum = row.account_number;
      if (!accounts[accountNum]) {
        accounts[accountNum] = {
          account_number: accountNum,
          business_name: row.customer.business_name_1 || `${row.customer.first_name_1} ${row.customer.last_name_1}`,
          address: row.customer.billing_address_1,
          invoices: [],
          total_due: 0,
          total_interest: 0
        };
      }
      accounts[accountNum].invoices.push(row);
      accounts[accountNum].total_due += parseFloat(row.total_amount);
      accounts[accountNum].total_interest += parseFloat(row.interest_accrued);
    });

    res.json(Object.values(accounts));
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Customer Statement
router.get('/statement/:accountNumber', async (req: Request, res: Response) => {
  try {
    const { accountNumber } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { account_number: accountNumber }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        account_number: accountNumber,
        status: { not: 'paid' }
      },
      orderBy: { due_date: 'asc' }
    });

    // Calculate aging buckets and interest
    const invoicesWithAging = invoices.map((inv: any) => {
      const dueDate = new Date(inv.due_date);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      let aging_bucket = '1-30';
      if (daysOverdue > 120) aging_bucket = 'over 120';
      else if (daysOverdue > 90) aging_bucket = '90-120';
      else if (daysOverdue > 60) aging_bucket = '60-90';
      else if (daysOverdue > 30) aging_bucket = '30-60';

      const interest_accrued = daysOverdue > 30 ? inv.total_amount * Math.pow(1.015, daysOverdue / 30) - inv.total_amount : 0;

      return { ...inv, aging_bucket, interest_accrued };
    });

    const payments = await prisma.payment.findMany({
      where: { account_number: accountNumber },
      orderBy: { date: 'desc' },
      take: 20
    });

    const totalDue = invoicesWithAging.reduce((sum: number, inv: any) => sum + parseFloat(inv.total_amount), 0);
    const totalInterest = invoicesWithAging.reduce((sum: number, inv: any) => sum + parseFloat(inv.interest_accrued), 0);

    res.json({
      customer,
      invoices: invoicesWithAging,
      payments,
      summary: {
        total_due: totalDue,
        total_interest: totalInterest,
        grand_total: totalDue + totalInterest
      },
      aging: invoicesWithAging.reduce((acc: Record<string, number>, inv: any) => {
        acc[inv.aging_bucket] = (acc[inv.aging_bucket] || 0) + inv.total_amount
        return acc
      }, {
        '1-30': 0,
        '30-60': 0,
        '60-90': 0,
        '90-120': 0,
        '120+': 0
      })
    });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List customers by various criteria
router.get('/customers/by-billing-code', async (req: Request, res: Response) => {
  try {
    const { billingCode } = req.query;
    const code = Array.isArray(billingCode) ? billingCode[0] : billingCode;
    const customers = await prisma.customer.findMany({
      where: { billing_code: code || undefined },
      select: {
        account_number: true,
        business_name_1: true,
        last_name_1: true,
        first_name_1: true,
        billing_address_1: true,
        billing_code: true,
        billing_amount: true
      },
      orderBy: { account_number: 'asc' }
    });
    res.json(customers);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/customers/by-class-code', async (req: Request, res: Response) => {
  try {
    const { classCode } = req.query;
    const code = Array.isArray(classCode) ? classCode[0] : classCode;
    const customers = await prisma.customer.findMany({
      where: { class_code: code || undefined },
      select: {
        account_number: true,
        business_name_1: true,
        last_name_1: true,
        first_name_1: true,
        billing_address_1: true,
        class_code: true,
        class_description: true
      },
      orderBy: { account_number: 'asc' }
    });
    res.json(customers);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const getStringQuery = (value: any): string | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : undefined;
  return typeof value === 'string' ? value : undefined;
};

router.get('/customers/by-zip', async (req: Request, res: Response) => {
  try {
    const zip = getStringQuery(req.query.zipCode);
    const customers = await prisma.customer.findMany({
      where: zip ? { billing_address_1: { contains: zip } } : undefined,
      select: {
        account_number: true,
        business_name_1: true,
        last_name_1: true,
        first_name_1: true,
        billing_address_1: true
      },
      orderBy: { account_number: 'asc' }
    });
    res.json(customers);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Past due report
router.get('/past-due', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: {
        status: { not: 'paid' },
        due_date: { lt: new Date().toISOString().split('T')[0] }
      },
      include: {
        customer: {
          select: {
            account_number: true,
            business_name_1: true,
            last_name_1: true,
            first_name_1: true,
            business_phone_1: true,
            billing_address_1: true,
            business_emails: true
          }
        }
      },
      orderBy: { due_date: 'asc' }
    });

    // Filter by days overdue in JavaScript
    const minDays = parseInt(days as string);
    const filteredRows = invoices.filter((inv: any) => {
      const dueDate = new Date(inv.due_date);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysOverdue >= minDays;
    }).map((inv: any) => {
      const dueDate = new Date(inv.due_date);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...inv,
        customer: inv.customer,
        daysOverdue
      };
    });

    res.json(filteredRows);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Alias endpoint for statements route used by frontend
const buildStatement = async (accountNumber: string) => {
  const customer = await prisma.customer.findUnique({
    where: { account_number: accountNumber }
  });

  if (!customer) {
    return null;
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      account_number: accountNumber,
      status: { not: 'paid' }
    },
    orderBy: { due_date: 'asc' }
  });

  const invoicesWithAging = invoices.map((inv: any) => {
    const dueDate = new Date(inv.due_date);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    let aging_bucket = '1-30';
    if (daysOverdue > 120) aging_bucket = 'over 120';
    else if (daysOverdue > 90) aging_bucket = '90-120';
    else if (daysOverdue > 60) aging_bucket = '60-90';
    else if (daysOverdue > 30) aging_bucket = '30-60';

    const interest_accrued = daysOverdue > 30 ? inv.total_amount * Math.pow(1.015, daysOverdue / 30) - inv.total_amount : 0;

    return { ...inv, aging_bucket, interest_accrued };
  });

  const payments = await prisma.payment.findMany({
    where: { account_number: accountNumber },
    orderBy: { date: 'desc' },
    take: 20
  });

  const totalDue = invoicesWithAging.reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0);
  const totalInterest = invoicesWithAging.reduce((sum: number, inv: any) => sum + Number(inv.interest_accrued), 0);

  return {
    customer,
    invoices: invoicesWithAging,
    payments,
    summary: {
      total_due: totalDue,
      total_interest: totalInterest,
      grand_total: totalDue + totalInterest
    },
    aging: invoicesWithAging.reduce((acc: Record<string, number>, inv: any) => {
      const bucket = inv.aging_bucket as string;
      acc[bucket] = (acc[bucket] || 0) + Number(inv.total_amount);
      return acc;
    }, {
      '1-30': 0,
      '30-60': 0,
      '60-90': 0,
      '90-120': 0,
      '120+': 0
    })
  };
};

router.get('/statements/:accountNumber', async (req: Request, res: Response) => {
  try {
    const { accountNumber } = req.params;
    const statement = await buildStatement(accountNumber);
    if (!statement) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(statement);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Aging report
router.get('/aging', async (req: Request, res: Response) => {
  try {
    const { asOfDate } = req.query;
    const invoices = await prisma.invoice.findMany({
      where: { status: { not: 'paid' } },
      include: { customer: true }
    });
    const today = asOfDate ? new Date(asOfDate as string) : new Date();
    const buckets = {
      '1-30': 0,
      '30-60': 0,
      '60-90': 0,
      '90-120': 0,
      '120+': 0
    };
    type AgingBucket = '1-30' | '30-60' | '60-90' | '90-120' | '120+';
    const rows = invoices.map((inv: any) => {
      const dueDate = new Date(inv.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      let aging_bucket: AgingBucket = '1-30';
      if (daysOverdue > 120) aging_bucket = '120+';
      else if (daysOverdue > 90) aging_bucket = '90-120';
      else if (daysOverdue > 60) aging_bucket = '60-90';
      else if (daysOverdue > 30) aging_bucket = '30-60';
      buckets[aging_bucket] += Number(inv.total_amount || 0);
      return {
        invoice_number: inv.invoice_number,
        account_number: inv.account_number,
        due_date: inv.due_date,
        total_amount: inv.total_amount,
        aging_bucket,
        customer_name: inv.customer.business_name_1 || `${inv.customer.first_name_1} ${inv.customer.last_name_1}`
      };
    });
    res.json({ rows, buckets });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Service history report
router.get('/service-history', async (req: Request, res: Response) => {
  try {
    const serviceCalls = await prisma.serviceCall.findMany({
      orderBy: { date: 'desc' },
      include: {
        customer: {
          select: {
            account_number: true,
            business_name_1: true,
            last_name_1: true,
            first_name_1: true
          }
        }
      },
      take: 100
    });
    res.json(serviceCalls.map((call: any) => ({
      service_call_number: call.service_call_number,
      account_number: call.account_number,
      customer_name: call.customer.business_name_1 || `${call.customer.first_name_1} ${call.customer.last_name_1}`,
      date: call.date,
      issue_code: call.issue_code,
      issue_description: call.issue_description,
      total_amount: call.total_amount,
      completed: call.completed
    })));
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
