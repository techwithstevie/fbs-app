import { Request, Response, Router } from 'express';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { prisma } from '../index';

const router = Router();

const createInvoicePdf = async (invoice: any, customer: any) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 50;
  let y = page.getHeight() - margin;
  const lineHeight = 18;

  const customerName = customer?.business_name_1 || `${customer?.first_name_1 || ''} ${customer?.last_name_1 || ''}`.trim();

  page.drawText('FBS Invoice', { x: margin, y, size: 18, font: fontBold });
  y -= lineHeight * 2;
  page.drawText(`Invoice Number: ${invoice.invoice_number}`, { x: margin, y, size: 12, font: font });
  y -= lineHeight;
  page.drawText(`Account Number: ${invoice.account_number}`, { x: margin, y, size: 12, font: font });
  y -= lineHeight;
  page.drawText(`Customer: ${customerName}`, { x: margin, y, size: 12, font: font });
  y -= lineHeight;
  page.drawText(`Date: ${invoice.date}`, { x: margin, y, size: 12, font: font });
  y -= lineHeight;
  page.drawText(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : ''}`, { x: margin, y, size: 12, font: font });
  y -= lineHeight;
  page.drawText(`Status: ${invoice.status}`, { x: margin, y, size: 12, font: font });
  y -= lineHeight * 1.5;

  page.drawText('Description', { x: margin, y, size: 14, font: fontBold });
  y -= lineHeight;
  page.drawText(invoice.description || 'N/A', { x: margin, y, size: 12, font: font });
  y -= lineHeight * 2;

  page.drawText(`Amount: $${invoice.amount.toFixed(2)}`, { x: margin, y, size: 12, font: font });
  y -= lineHeight;
  page.drawText(`Sales Tax Rate: ${invoice.sales_tax_rate ?? 0}%`, { x: margin, y, size: 12, font: font });
  y -= lineHeight;
  page.drawText(`Sales Tax: $${invoice.sales_tax_amount?.toFixed(2) ?? '0.00'}`, { x: margin, y, size: 12, font: font });
  y -= lineHeight;
  page.drawText(`Total: $${invoice.total_amount?.toFixed(2) ?? '0.00'}`, { x: margin, y, size: 12, font: fontBold });

  return pdfDoc.save();
};

// Get all invoices with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { accountNumber, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (accountNumber) {
      where.account_number = accountNumber;
    }
    if (status) {
      where.status = status;
    }
    if (startDate) {
      where.date = { gte: startDate };
    }
    if (endDate) {
      where.date = { lte: endDate };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      skip: offset,
      take: Number(limit),
      orderBy: { date: 'desc' }
    });

    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get invoice by number
router.get('/:invoiceNumber', async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { invoice_number: req.params.invoiceNumber }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create invoice
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      account_number, date, description, amount, invoice_type, tax_exempt, sales_tax_rate
    } = req.body;

    // Generate unique invoice number
    const invoice_number = 'INV-' + Date.now().toString().slice(-10) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const sales_tax_amount = tax_exempt ? 0 : (amount * (sales_tax_rate || 0) / 100);
    const total_amount = amount + sales_tax_amount;

    const due_date = new Date(date);
    due_date.setDate(due_date.getDate() + 30);

    const invoice = await prisma.invoice.create({
      data: {
        invoice_number,
        account_number,
        date,
        description,
        amount,
        invoice_type,
        tax_exempt: tax_exempt ? 1 : 0,
        sales_tax_rate,
        sales_tax_amount,
        total_amount,
        status: 'pending',
        due_date: due_date.toISOString().split('T')[0]
      }
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update invoice status
router.put('/:invoiceNumber/status', async (req: Request, res: Response) => {
  try {
    const { status, paid_date } = req.body;

    const invoice = await prisma.invoice.update({
      where: { invoice_number: req.params.invoiceNumber },
      data: { status, paid_date }
    });

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download invoice as a PDF document
router.get('/:invoiceNumber/download', async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { invoice_number: req.params.invoiceNumber }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const customer = await prisma.customer.findUnique({
      where: { account_number: invoice.account_number }
    });

    const pdfBytes = await createInvoicePdf(invoice, customer);
    const filename = `${invoice.invoice_number}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const createMonthlyInvoices = async (options: {
  startAccount?: string
  endAccount?: string
  taxRate?: number
  billingMonth?: number
  billingYear?: number
}) => {
  const { startAccount, endAccount, taxRate, billingMonth, billingYear } = options;
  const start = startAccount ? startAccount.toString().padStart(10, '0') : '0000000000';
  const end = endAccount ? endAccount.toString().padStart(10, '0') : '9999999999';

  const accounts = await prisma.customer.findMany({
    where: {
      account_number: {
        gte: start,
        lte: end
      },
      billing_code: { in: ['16', '88'] },
      billing_amount: { gt: 0 }
    }
  });

  const invoices = [];
  const currentMonth = billingMonth || new Date().getMonth() + 1;
  const currentYear = billingYear || new Date().getFullYear();

  for (const account of accounts) {
    const invoice_number = 'INV-' + Date.now().toString().slice(-10) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const tax_exempt = parseInt(account.billing_code || '0') >= 20;
    const billingAmount = account.billing_amount || 0;
    const salesTaxAmount = tax_exempt ? 0 : (billingAmount * (taxRate || 0) / 100);
    const totalAmount = billingAmount + salesTaxAmount;

    const date = new Date(currentYear, currentMonth - 1, 1);
    const due_date = new Date(date);
    due_date.setDate(due_date.getDate() + 30);

    const invoice = await prisma.invoice.create({
      data: {
        invoice_number,
        account_number: account.account_number,
        date: date.toISOString().split('T')[0],
        description: account.billing_description || 'Monthly Monitoring Service',
        amount: billingAmount,
        invoice_type: 'monitoring',
        tax_exempt: tax_exempt ? 1 : 0,
        sales_tax_rate: taxRate,
        sales_tax_amount: salesTaxAmount,
        total_amount: totalAmount,
        status: 'pending',
        due_date: due_date.toISOString().split('T')[0]
      }
    });

    invoices.push(invoice);

    await prisma.customer.update({
      where: { account_number: account.account_number },
      data: {
        next_billing_month: currentMonth + 1 > 12 ? 1 : currentMonth + 1,
        next_billing_year: currentMonth + 1 > 12 ? currentYear + 1 : currentYear
      }
    });
  }

  return invoices;
};

// Generate monthly billing invoices
router.post('/generate-monthly', async (req: Request, res: Response) => {
  try {
    const invoices = await createMonthlyInvoices(req.body || {});
    res.status(201).json({ generated: invoices.length, invoices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Alias route for frontend monthly billing button
router.post('/monthly', async (req: Request, res: Response) => {
  try {
    const invoices = await createMonthlyInvoices(req.body || {});
    res.status(201).json({ generated: invoices.length, invoices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
