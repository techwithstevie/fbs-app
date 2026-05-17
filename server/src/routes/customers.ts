import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all customers with pagination and search
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 50, field } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search && field) {
      where[field as string] = {
        contains: search as string,
        mode: 'insensitive'
      };
    } else if (search) {
      where.OR = [
        { account_number: { contains: search as string } },
        { business_name_1: { contains: search as string } },
        { last_name_1: { contains: search as string } },
        { billing_address_1: { contains: search as string } },
        { business_phone_1: { contains: search as string } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: offset,
        take: Number(limit),
        orderBy: { account_number: 'asc' }
      }),
      prisma.customer.count({ where })
    ]);
    
    res.json({
      customers,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer by account number
router.get('/:accountNumber', async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { account_number: req.params.accountNumber }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get next available account number
router.get('/next-account-number/available', async (req: Request, res: Response) => {
  try {
    const maxAccount = await prisma.customer.findFirst({
      orderBy: { account_number: 'desc' },
      select: { account_number: true }
    });
    
    const nextAccount = (maxAccount ? parseInt(maxAccount.account_number) : 0) + 1;
    res.json({ nextAccountNumber: nextAccount.toString().padStart(10, '0') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.create({
      data: {
        ...req.body,
        business_emails: JSON.stringify(req.body.business_emails || []),
        billing_emails: JSON.stringify(req.body.billing_emails || []),
        personal_emails: JSON.stringify(req.body.personal_emails || []),
        last_nfpa_form_on_file: req.body.last_nfpa_form_on_file ? 1 : 0,
        monitoring_agreement_on_file: req.body.monitoring_agreement_on_file ? 1 : 0
      }
    });
    
    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update customer
router.put('/:accountNumber', async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.update({
      where: { account_number: req.params.accountNumber },
      data: {
        ...req.body,
        updated_at: new Date().toISOString()
      }
    });
    
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete customer (with warning)
router.delete('/:accountNumber', async (req: Request, res: Response) => {
  try {
    await prisma.customer.delete({
      where: { account_number: req.params.accountNumber }
    });
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
