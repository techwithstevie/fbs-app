import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all payments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { accountNumber, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (accountNumber) {
      where.account_number = accountNumber;
    }
    if (startDate) {
      where.date = { gte: startDate };
    }
    if (endDate) {
      where.date = { lte: endDate };
    }
    
    const payments = await prisma.payment.findMany({
      where,
      skip: offset,
      take: Number(limit),
      orderBy: { date: 'desc' }
    });
    
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payment
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      account_number, date, check_number, check_date, deposit_date,
      invoice_number, amount, payment_type
    } = req.body;
    
    const payment_number = 'PAY-' + Date.now().toString().slice(-10) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const payment = await prisma.payment.create({
      data: {
        payment_number,
        account_number,
        date,
        check_number,
        check_date,
        deposit_date,
        invoice_number,
        amount,
        payment_type
      }
    });
    
    // Update invoice status if fully paid
    if (invoice_number) {
      const invoice = await prisma.invoice.findUnique({
        where: { invoice_number }
      });
      
      if (invoice) {
        const payments = await prisma.payment.findMany({
          where: { invoice_number }
        });
        
        const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        
        if (totalPaid >= invoice.total_amount) {
          await prisma.invoice.update({
            where: { invoice_number },
            data: { status: 'paid', paid_date: date }
          });
        }
      }
    }
    
    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment by number
router.get('/:paymentNumber', async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { payment_number: req.params.paymentNumber }
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
