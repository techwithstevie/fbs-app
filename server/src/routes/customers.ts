import { Request, Response, Router } from 'express';
import { z, ZodError } from 'zod';
import { prisma } from '../index';

const router = Router();

const parseJsonArray = (value: any): any[] => {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

const emailArraySchema = z.preprocess((value) => {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return value;
}, z.array(z.object({
  email: z.string().email(),
  description: z.string().max(100).optional()
})).transform((items) => items.filter((item) => item.email.trim() !== '')));

const optionalNumberField = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : Number(trimmed);
  }
  return value;
}, z.number().nonnegative().optional());

const customerCreateSchema = z.object({
  account_number: z.string().regex(/^\d{1,10}$/, 'Account number must be 1-10 digits'),
  class_code: z.string().regex(/^\d{4}$/, 'Class code must be 4 digits'),
  class_description: z.string().max(255).optional(),
  business_name_1: z.string().max(100).optional(),
  business_name_2: z.string().max(100).optional(),
  business_address_1: z.string().max(100).optional(),
  business_address_2: z.string().max(100).optional(),
  business_phone_1: z.string().max(50).optional(),
  business_phone_1_desc: z.string().max(100).optional(),
  business_phone_2: z.string().max(50).optional(),
  business_phone_2_desc: z.string().max(100).optional(),
  business_emails: emailArraySchema.optional(),
  billing_name_1: z.string().max(100).optional(),
  billing_name_2: z.string().max(100).optional(),
  billing_address_1: z.string().max(100).optional(),
  billing_address_2: z.string().max(100).optional(),
  billing_address_3: z.string().max(100).optional(),
  billing_phone_1: z.string().max(50).optional(),
  billing_phone_1_desc: z.string().max(100).optional(),
  billing_phone_2: z.string().max(50).optional(),
  billing_phone_2_desc: z.string().max(100).optional(),
  billing_phone_3: z.string().max(50).optional(),
  billing_phone_3_desc: z.string().max(100).optional(),
  billing_emails: emailArraySchema.optional(),
  last_name_1: z.string().max(100).optional(),
  last_name_2: z.string().max(100).optional(),
  first_name_1: z.string().max(25).optional(),
  first_name_2: z.string().max(25).optional(),
  contact_1_name: z.string().max(50).optional(),
  contact_2_name: z.string().max(50).optional(),
  home_phone_1: z.string().max(50).optional(),
  home_phone_2: z.string().max(50).optional(),
  cell_phone_1: z.string().max(50).optional(),
  cell_phone_1_desc: z.string().max(25).optional(),
  cell_phone_2: z.string().max(50).optional(),
  cell_phone_2_desc: z.string().max(25).optional(),
  cell_phone_3: z.string().max(50).optional(),
  cell_phone_3_desc: z.string().max(25).optional(),
  personal_emails: emailArraySchema.optional(),
  billing_code: z.string().regex(/^\d{1,3}$/, 'Billing code must be 1-3 digits').optional(),
  billing_description: z.string().max(255).optional(),
  billing_amount: optionalNumberField,
  next_billing_month: z.number().int().min(1).max(12).optional(),
  next_billing_year: z.number().int().optional(),
  service_call_rate: optionalNumberField,
  hourly_labor_rate: optionalNumberField,
  discount_percent: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : Number(trimmed);
    }
    return value;
  }, z.number().min(0).max(100).optional()),
  discount_reason: z.string().max(50).optional(),
  installation_date: z.string().max(20).optional(),
  installing_company: z.string().max(100).optional(),
  access_codes: z.string().max(100).optional(),
  panel_model: z.string().max(100).optional(),
  panel_location: z.string().max(100).optional(),
  transformer_location: z.string().max(100).optional(),
  panel_codes: z.string().max(200).optional(),
  panel_phone: z.string().max(50).optional(),
  zone_list: z.string().max(500).optional(),
  starlink_model: z.string().max(100).optional(),
  starlink_number: z.string().max(100).optional(),
  central_station: z.string().max(100).optional(),
  central_station_account: z.string().max(100).optional(),
  central_station_password: z.string().max(100).optional(),
  last_fire_inspection_date: z.string().max(20).optional(),
  last_nfpa_form_on_file: z.boolean().optional(),
  last_service_date: z.string().max(20).optional(),
  last_service_description: z.string().max(255).optional(),
  custom_comments: z.string().max(200).optional(),
  custom_notes: z.string().max(500).optional(),
  monitoring_agreement_on_file: z.boolean().optional()
}).strict();

const customerUpdateSchema = customerCreateSchema.omit({ account_number: true }).partial();

const parseCustomerRequest = (body: any) => {
  const parsed = customerCreateSchema.parse(body);
  return parsed;
};

const normalizeCustomer = (customer: any) => ({
  ...customer,
  business_emails: parseJsonArray(customer.business_emails),
  billing_emails: parseJsonArray(customer.billing_emails),
  personal_emails: parseJsonArray(customer.personal_emails),
  last_nfpa_form_on_file: Boolean(customer.last_nfpa_form_on_file),
  monitoring_agreement_on_file: Boolean(customer.monitoring_agreement_on_file)
});

// Get all customers with pagination and search
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 50, field } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};

    const buildFieldFilter = () => {
      const searchValue = search as string;
      if (!searchValue) return undefined;

      if (field && field !== 'all') {
        switch (field) {
          case 'name':
            return {
              OR: [
                { business_name_1: { contains: searchValue, mode: 'insensitive' } },
                { business_name_2: { contains: searchValue, mode: 'insensitive' } },
                { first_name_1: { contains: searchValue, mode: 'insensitive' } },
                { first_name_2: { contains: searchValue, mode: 'insensitive' } },
                { last_name_1: { contains: searchValue, mode: 'insensitive' } },
                { last_name_2: { contains: searchValue, mode: 'insensitive' } },
                { contact_1_name: { contains: searchValue, mode: 'insensitive' } },
                { contact_2_name: { contains: searchValue, mode: 'insensitive' } }
              ]
            };
          case 'address':
            return {
              OR: [
                { billing_address_1: { contains: searchValue, mode: 'insensitive' } },
                { billing_address_2: { contains: searchValue, mode: 'insensitive' } },
                { billing_address_3: { contains: searchValue, mode: 'insensitive' } },
                { business_address_1: { contains: searchValue, mode: 'insensitive' } },
                { business_address_2: { contains: searchValue, mode: 'insensitive' } }
              ]
            };
          case 'zip':
            return {
              OR: [
                { billing_address_1: { contains: searchValue, mode: 'insensitive' } },
                { billing_address_2: { contains: searchValue, mode: 'insensitive' } },
                { billing_address_3: { contains: searchValue, mode: 'insensitive' } },
                { business_address_1: { contains: searchValue, mode: 'insensitive' } },
                { business_address_2: { contains: searchValue, mode: 'insensitive' } }
              ]
            };
          case 'area_code':
            return {
              OR: [
                { business_phone_1: { contains: searchValue, mode: 'insensitive' } },
                { business_phone_2: { contains: searchValue, mode: 'insensitive' } },
                { billing_phone_1: { contains: searchValue, mode: 'insensitive' } },
                { billing_phone_2: { contains: searchValue, mode: 'insensitive' } },
                { billing_phone_3: { contains: searchValue, mode: 'insensitive' } },
                { home_phone_1: { contains: searchValue, mode: 'insensitive' } },
                { home_phone_2: { contains: searchValue, mode: 'insensitive' } },
                { cell_phone_1: { contains: searchValue, mode: 'insensitive' } },
                { cell_phone_2: { contains: searchValue, mode: 'insensitive' } },
                { cell_phone_3: { contains: searchValue, mode: 'insensitive' } }
              ]
            };
          case 'telephone':
            return {
              OR: [
                { business_phone_1: { contains: searchValue, mode: 'insensitive' } },
                { business_phone_2: { contains: searchValue, mode: 'insensitive' } },
                { billing_phone_1: { contains: searchValue, mode: 'insensitive' } },
                { billing_phone_2: { contains: searchValue, mode: 'insensitive' } },
                { billing_phone_3: { contains: searchValue, mode: 'insensitive' } },
                { home_phone_1: { contains: searchValue, mode: 'insensitive' } },
                { home_phone_2: { contains: searchValue, mode: 'insensitive' } },
                { cell_phone_1: { contains: searchValue, mode: 'insensitive' } },
                { cell_phone_2: { contains: searchValue, mode: 'insensitive' } },
                { cell_phone_3: { contains: searchValue, mode: 'insensitive' } }
              ]
            };
          case 'email':
            return {
              OR: [
                { business_emails: { contains: searchValue, mode: 'insensitive' } },
                { billing_emails: { contains: searchValue, mode: 'insensitive' } },
                { personal_emails: { contains: searchValue, mode: 'insensitive' } }
              ]
            };
          case 'invoice_number':
            return {
              OR: [
                { invoices: { some: { invoice_number: { contains: searchValue, mode: 'insensitive' } } } }
              ]
            };
          case 'system_type':
            return {
              class_code: { contains: searchValue, mode: 'insensitive' }
            };
          case 'starlink_number':
          case 'class_code':
          case 'billing_code':
            return {
              [field]: { contains: searchValue, mode: 'insensitive' }
            };
          default:
            return {
              [field as string]: { contains: searchValue, mode: 'insensitive' }
            };
        }
      }

      return {
        OR: [
          { account_number: { contains: searchValue, mode: 'insensitive' } },
          { business_name_1: { contains: searchValue, mode: 'insensitive' } },
          { business_name_2: { contains: searchValue, mode: 'insensitive' } },
          { first_name_1: { contains: searchValue, mode: 'insensitive' } },
          { last_name_1: { contains: searchValue, mode: 'insensitive' } },
          { billing_address_1: { contains: searchValue, mode: 'insensitive' } },
          { billing_address_2: { contains: searchValue, mode: 'insensitive' } },
          { business_phone_1: { contains: searchValue, mode: 'insensitive' } },
          { billing_phone_1: { contains: searchValue, mode: 'insensitive' } },
          { home_phone_1: { contains: searchValue, mode: 'insensitive' } },
          { cell_phone_1: { contains: searchValue, mode: 'insensitive' } },
          { business_emails: { contains: searchValue, mode: 'insensitive' } },
          { billing_emails: { contains: searchValue, mode: 'insensitive' } },
          { personal_emails: { contains: searchValue, mode: 'insensitive' } },
          { starlink_number: { contains: searchValue, mode: 'insensitive' } },
          { invoices: { some: { invoice_number: { contains: searchValue, mode: 'insensitive' } } } }
        ]
      };
    };

    const fieldFilter = buildFieldFilter();
    if (fieldFilter) {
      Object.assign(where, fieldFilter);
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
      customers: customers.map(normalizeCustomer),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
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

// Get customer by account number
router.get('/:accountNumber', async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { account_number: req.params.accountNumber }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(normalizeCustomer(customer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = customerCreateSchema.parse(req.body);
    const customer = await prisma.customer.create({
      data: {
        ...parsed,
        business_emails: JSON.stringify(parsed.business_emails || []),
        billing_emails: JSON.stringify(parsed.billing_emails || []),
        personal_emails: JSON.stringify(parsed.personal_emails || []),
        last_nfpa_form_on_file: parsed.last_nfpa_form_on_file ? 1 : 0,
        monitoring_agreement_on_file: parsed.monitoring_agreement_on_file ? 1 : 0
      }
    });

    res.status(201).json(normalizeCustomer(customer));
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update customer
router.put('/:accountNumber', async (req: Request, res: Response) => {
  try {
    const parsed = customerUpdateSchema.parse(req.body);
    const customer = await prisma.customer.update({
      where: { account_number: req.params.accountNumber },
      data: {
        ...parsed,
        business_emails: JSON.stringify(parsed.business_emails || []),
        billing_emails: JSON.stringify(parsed.billing_emails || []),
        personal_emails: JSON.stringify(parsed.personal_emails || []),
        last_nfpa_form_on_file: parsed.last_nfpa_form_on_file ? 1 : 0,
        monitoring_agreement_on_file: parsed.monitoring_agreement_on_file ? 1 : 0,
        updated_at: new Date().toISOString()
      }
    });

    res.json(normalizeCustomer(customer));
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
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
