import { Request, Response, Router } from 'express';

const router = Router();

// Class code descriptions
const CLASS_CODE_DESCRIPTIONS: Record<string, Record<string, string>> = {
  status: {
    '1': 'Lease w/ monitoring',
    '2': 'Lease no monitoring',
    '3': 'Monitoring and Service – no charge for service',
    '4': 'Service Only',
    '5': 'Monitoring only',
    '6': 'FBS Installed -- higher service call fee and hourly rate',
    '7': 'FBS Modified',
    '8': 'FBS Has Serviced -- higher service call fee and hourly rate',
    '9': 'FBS Acquisition'
  },
  type: {
    '1': 'Commercial',
    '2': 'Residential',
    '3': 'Municipal/Government',
    '4': 'Billing'
  },
  system: {
    '1': 'Burglar and Fire Alarm',
    '2': 'Burglar Alarm Only',
    '3': 'Fire Alarm',
    '4': 'Access Control',
    '5': 'Integrated System',
    '6': 'Audio System',
    '7': 'Multiple Systems',
    '8': 'Custom'
  }
};

const BILLING_CODE_DESCRIPTIONS: Record<string, string> = {
  '1': 'Annually in January',
  '2': 'Annually in February',
  '3': 'Annually in March',
  '4': 'Annually in April',
  '5': 'Annually in May',
  '6': 'Annually in June',
  '7': 'Annually in July',
  '8': 'Annually in August',
  '9': 'Annually in September',
  '10': 'Annually in October',
  '11': 'Annually in November',
  '12': 'Annually in December',
  '13': 'Quarterly (Jan, Apr, Jul, Oct)',
  '14': 'Quarterly (Feb, May, Aug, Nov)',
  '15': 'Quarterly (Mar, Jun, Sep, Dec)',
  '16': 'Monthly',
  '41': 'Semi-annually (January)',
  '42': 'Semi-annually (February)',
  '43': 'Semi-annually (March)',
  '44': 'Semi-annually (April)',
  '45': 'Semi-annually (May)',
  '46': 'Semi-annually (June)',
  '77': 'Billed on other account number',
  '88': 'Billed monthly on credit card',
  '99': 'Free – No charge'
};

// Get class code description
router.get('/class-code/description', (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string' || code.length !== 4) {
    return res.status(400).json({ error: 'Invalid class code' });
  }

  const status = CLASS_CODE_DESCRIPTIONS.status[code[0]] || 'Unknown';
  const type = CLASS_CODE_DESCRIPTIONS.type[code[1]] || 'Unknown';
  const system = CLASS_CODE_DESCRIPTIONS.system[code[2]] || 'Unknown';
  const description = `${status} ${type} ${system}`;

  res.json({ description });
});

// Get billing code description
router.get('/billing-code/description', (req: Request, res: Response) => {
  const { code } = req.query;
  const description = BILLING_CODE_DESCRIPTIONS[code as string] || 'Unknown';
  const taxExempt = parseInt(code as string) >= 20;

  res.json({ description, taxExempt });
});

// Update billing amounts for multiple accounts
router.post('/update-billing', async (req: Request, res: Response) => {
  try {
    const { criteria, updateType, value } = req.body;
    const { prisma } = require('../index');

    const where: any = {};

    if (criteria.accountNumber) {
      where.account_number = criteria.accountNumber;
    }
    if (criteria.classCode) {
      where.class_code = criteria.classCode;
    } else if (criteria.systemType) {
      where.class_code = { contains: criteria.systemType };
    }
    if (criteria.name) {
      where.OR = [
        { business_name_1: { contains: criteria.name, mode: 'insensitive' } },
        { business_name_2: { contains: criteria.name, mode: 'insensitive' } },
        { first_name_1: { contains: criteria.name, mode: 'insensitive' } },
        { first_name_2: { contains: criteria.name, mode: 'insensitive' } },
        { last_name_1: { contains: criteria.name, mode: 'insensitive' } },
        { last_name_2: { contains: criteria.name, mode: 'insensitive' } }
      ];
    }
    if (criteria.city) {
      where.billing_address_1 = { contains: criteria.city };
    }
    if (criteria.centralStation) {
      where.central_station = { contains: criteria.centralStation, mode: 'insensitive' };
    }
    if (criteria.monitoringAgreementOnFile !== undefined) {
      where.monitoring_agreement_on_file = criteria.monitoringAgreementOnFile ? 1 : 0;
    }
    if (criteria.dateInstalledFrom) {
      where.installation_date = { gte: criteria.dateInstalledFrom };
    }
    if (criteria.dateInstalledTo) {
      where.installation_date = { lte: criteria.dateInstalledTo };
    }

    if (updateType === 'percentage') {
      const accountsToUpdate = await prisma.customer.findMany({ where, select: { account_number: true, billing_amount: true } });
      const updateResults = [] as any[];

      for (const account of accountsToUpdate) {
        const currentAmount = Number(account.billing_amount || 0);
        const updatedAmount = currentAmount * (1 + Number(value) / 100);
        updateResults.push(
          prisma.customer.update({
            where: { account_number: account.account_number },
            data: { billing_amount: Number(updatedAmount.toFixed(2)) }
          })
        );
      }

      await Promise.all(updateResults);
    } else if (updateType === 'fixed') {
      await prisma.customer.updateMany({ where, data: { billing_amount: Number(value) } });
    }

    const updatedAccounts = await prisma.customer.findMany({ where });
    res.json({ updated: updatedAccounts.length, accounts: updatedAccounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update sales tax rate
router.post('/update-tax-rate', async (req: Request, res: Response) => {
  try {
    const { taxRate, criteria } = req.body;
    const { prisma } = require('../index');

    const where: any = {};
    if (criteria) {
      if (criteria.accountNumber) {
        where.account_number = criteria.accountNumber;
      }
      if (criteria.classCode) {
        where.class_code = criteria.classCode;
      } else if (criteria.systemType) {
        where.class_code = { contains: criteria.systemType };
      }
      if (criteria.name) {
        where.OR = [
          { business_name_1: { contains: criteria.name, mode: 'insensitive' } },
          { business_name_2: { contains: criteria.name, mode: 'insensitive' } },
          { first_name_1: { contains: criteria.name, mode: 'insensitive' } },
          { first_name_2: { contains: criteria.name, mode: 'insensitive' } },
          { last_name_1: { contains: criteria.name, mode: 'insensitive' } },
          { last_name_2: { contains: criteria.name, mode: 'insensitive' } }
        ];
      }
      if (criteria.city) {
        where.billing_address_1 = { contains: criteria.city };
      }
      if (criteria.centralStation) {
        where.central_station = { contains: criteria.centralStation, mode: 'insensitive' };
      }
      if (criteria.monitoringAgreementOnFile !== undefined) {
        where.monitoring_agreement_on_file = criteria.monitoringAgreementOnFile ? 1 : 0;
      }
      if (criteria.dateInstalledFrom) {
        where.installation_date = { gte: criteria.dateInstalledFrom };
      }
      if (criteria.dateInstalledTo) {
        where.installation_date = { lte: criteria.dateInstalledTo };
      }
    }

    const result = await prisma.customer.updateMany({
      where,
      data: { sales_tax_rate: taxRate }
    });

    res.json({
      updated: result.count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
