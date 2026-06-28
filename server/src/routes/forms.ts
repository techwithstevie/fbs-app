import { Request, Response, Router } from 'express';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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

const createFormPdf = async (customer: any, formType: string) => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();
    let y = height - 50;
    const lineHeight = 18;

    const formTitle = formType === 'installation-cert' ? 'Certificate of Installation'
        : formType === 'monitoring-cert' ? 'Certificate of Monitoring'
            : formType === 'inspection-form' ? 'Inspection Form'
                : formType === 'central-station' ? 'Central Station Form'
                    : 'Custom Form';

    page.drawText('FIRE & BURGLAR SECURITY', { x: 50, y, size: 16, font: fontBold, color: rgb(0, 0, 0) });
    y -= lineHeight * 1.5;
    page.drawText(formTitle, { x: 50, y, size: 14, font: fontBold });
    y -= lineHeight * 1.5;

    const name = customer.business_name_1 || `${customer.first_name_1 || ''} ${customer.last_name_1 || ''}`.trim();
    const details = [
        `Account Number: ${customer.account_number}`,
        `Customer: ${name}`,
        `Address: ${customer.billing_address_1 || ''}`,
        `Phone: ${customer.business_phone_1 || ''}`,
        `Class Code: ${customer.class_code || ''}`,
        `Panel Model: ${customer.panel_model || ''}`,
        `Installation Date: ${customer.installation_date || ''}`,
        `Central Station: ${customer.central_station || ''}`,
        `Central Station Account: ${customer.central_station_account || ''}`
    ];

    details.forEach((line) => {
        page.drawText(line, { x: 50, y, size: 11, font });
        y -= lineHeight;
    });

    y -= lineHeight * 0.5;
    page.drawText('Comments:', { x: 50, y, size: 12, font: fontBold });
    y -= lineHeight;
    page.drawText(customer.custom_comments || 'N/A', { x: 50, y, size: 11, font });
    y -= lineHeight * 1.5;

    page.drawText('Signature:', { x: 50, y, size: 12, font: fontBold });
    y -= lineHeight * 2;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });

    return await doc.save();
};

router.get('/:formType/:accountNumber/download', async (req: Request, res: Response) => {
    try {
        const { formType, accountNumber } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { account_number: accountNumber }
        });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const pdfBytes = await createFormPdf(customer, formType);
        const filename = `${formType}-${customer.account_number}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(Buffer.from(pdfBytes));
    } catch (err: unknown) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
