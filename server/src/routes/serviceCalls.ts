import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

const SERVICE_ISSUES: Record<string, string> = {
  '1': 'No green light',
  '2': 'Low battery',
  '3': 'Failure to communicate',
  '4': 'Fire Alarm falsed',
  '10': 'System changes at Subscriber\'s expense',
  '49': 'Custom problem',
  '99': 'Notes'
};

// Get all service calls
router.get('/', async (req: Request, res: Response) => {
  try {
    const { accountNumber, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (accountNumber) {
      where.account_number = accountNumber;
    }
    if (status) {
      where.completed = status === 'completed' ? 1 : 0;
    }
    if (startDate) {
      where.date = { gte: startDate };
    }
    if (endDate) {
      where.date = { lte: endDate };
    }
    
    const serviceCalls = await prisma.serviceCall.findMany({
      where,
      skip: offset,
      take: Number(limit),
      orderBy: { date: 'desc' }
    });
    
    res.json(serviceCalls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create service call
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      account_number, date, special_message, issue_code, issue_description,
      custom_problem, notes, labor_hours, labor_rate, parts_cost
    } = req.body;
    
    // Get customer's rates if not provided
    let actual_labor_rate = labor_rate;
    let actual_service_rate = 0;
    
    if (!labor_rate) {
      const customer = await prisma.customer.findUnique({
        where: { account_number },
        select: { hourly_labor_rate: true, service_call_rate: true }
      });
      
      if (customer) {
        actual_labor_rate = customer.hourly_labor_rate;
        actual_service_rate = customer.service_call_rate || 0;
      }
    }
    
    const service_call_number = 'SC-' + Date.now().toString().slice(-10) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const labor_amount = (labor_hours || 0) * (actual_labor_rate || 0);
    const total_amount = actual_service_rate + labor_amount + (parts_cost || 0);
    
    const serviceCall = await prisma.serviceCall.create({
      data: {
        service_call_number,
        account_number,
        date,
        special_message,
        issue_code,
        issue_description,
        custom_problem,
        notes,
        labor_hours,
        labor_rate: actual_labor_rate,
        labor_amount,
        parts_cost,
        total_amount,
        completed: 0
      }
    });
    
    // Update customer's last service date
    await prisma.customer.update({
      where: { account_number },
      data: {
        last_service_date: date,
        last_service_description: issue_description || custom_problem
      }
    });
    
    res.status(201).json(serviceCall);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update service call
router.put('/:serviceCallNumber', async (req: Request, res: Response) => {
  try {
    const { completed, labor_hours, labor_rate, parts_cost } = req.body;
    
    const labor_amount = (labor_hours || 0) * (labor_rate || 0);
    const total_amount = labor_amount + (parts_cost || 0);
    
    const serviceCall = await prisma.serviceCall.update({
      where: { service_call_number: req.params.serviceCallNumber },
      data: {
        completed: completed ? 1 : 0,
        labor_hours,
        labor_rate,
        labor_amount,
        parts_cost,
        total_amount
      }
    });
    
    res.json(serviceCall);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get service call by number
router.get('/:serviceCallNumber', async (req: Request, res: Response) => {
  try {
    const serviceCall = await prisma.serviceCall.findUnique({
      where: { service_call_number: req.params.serviceCallNumber }
    });
    
    if (!serviceCall) {
      return res.status(404).json({ error: 'Service call not found' });
    }
    
    res.json(serviceCall);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
