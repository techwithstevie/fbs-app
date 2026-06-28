import { Request, Response, Router } from 'express';
import { prisma } from '../index';

const router = Router();

const renderCustomerForm = (customer: any, formType: string) => {
    const name = customer.business_name_1 || `${customer.first_name_1 || ''} ${customer.last_name_1 || ''}`.trim();
    return {
        customer,
        formType,
        generatedAt: new Date().toISOString().split('T')[0],
        title: formType === 'installation-cert' ? 'Certificate of Installation'
            : formType === 'monitoring-cert' ? 'Certificate of Monitoring'
                : formType === 'inspection-form' ? 'Inspection Form'
                    : formType === 'central-station' ? 'Central Station Form'
                        : 'Custom Form',
        details: {
            accountNumber: customer.account_number,
            customerName: name,
            address: customer.billing_address_1,
            phone: customer.business_phone_1,
            classCode: customer.class_code,
            panelModel: customer.panel_model,
            installationDate: customer.installation_date,
            centralStation: customer.central_station,
            centralStationAccount: customer.central_station_account
        }
    };
};

router.get('/:formType/:accountNumber', async (req: Request, res: Response) => {
    try {
        const { formType, accountNumber } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { account_number: accountNumber }
        });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(renderCustomerForm(customer, formType));
    } catch (err: unknown) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
