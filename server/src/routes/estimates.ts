import { Request, Response, Router } from 'express'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { prisma } from '../index'

const router = Router()

const parseItems = (items: any): any[] => {
    if (!items) return []
    if (Array.isArray(items)) return items
    try {
        return JSON.parse(items)
    } catch {
        return []
    }
}

const createEstimatePdf = async (estimate: any) => {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const margin = 50
    const lineHeight = 18
    let y = page.getHeight() - margin

    page.drawText('FBS Estimate', { x: margin, y, size: 18, font: fontBold })
    y -= lineHeight * 2
    page.drawText(`Estimate #: ${estimate.estimate_number}`, { x: margin, y, size: 12, font })
    y -= lineHeight
    page.drawText(`Account #: ${estimate.account_number}`, { x: margin, y, size: 12, font })
    y -= lineHeight
    page.drawText(`Date: ${estimate.date}`, { x: margin, y, size: 12, font })
    y -= lineHeight
    page.drawText(`Status: ${estimate.status}`, { x: margin, y, size: 12, font })
    y -= lineHeight
    if (estimate.valid_until) {
        page.drawText(`Valid Until: ${new Date(estimate.valid_until).toISOString().split('T')[0]}`, { x: margin, y, size: 12, font })
        y -= lineHeight
    }
    y -= lineHeight
    page.drawText('Description', { x: margin, y, size: 14, font: fontBold })
    y -= lineHeight
    page.drawText(estimate.description || 'N/A', { x: margin, y, size: 12, font })
    y -= lineHeight * 2

    page.drawText('Line Items', { x: margin, y, size: 14, font: fontBold })
    y -= lineHeight
    page.drawText('Description | Qty | Unit Price | Total', { x: margin, y, size: 11, font })
    y -= lineHeight

    const items = estimate.items || []
    let currentPage = page
    items.forEach((item: any) => {
        const line = `${item.description || '-'} | ${item.qty} | $${Number(item.unitPrice).toFixed(2)} | $${(Number(item.qty) * Number(item.unitPrice)).toFixed(2)}`
        if (y < margin + lineHeight * 4) {
            currentPage = pdfDoc.addPage()
            y = currentPage.getHeight() - margin
        }
        currentPage.drawText(line, { x: margin, y, size: 11, font })
        y -= lineHeight
    })

    y -= lineHeight
    page.drawText(`Subtotal: $${(estimate.subtotal ?? 0).toFixed(2)}`, { x: margin, y, size: 12, font: fontBold })
    y -= lineHeight
    page.drawText(`Tax: $${(estimate.tax_amount ?? 0).toFixed(2)}`, { x: margin, y, size: 12, font: fontBold })
    y -= lineHeight
    page.drawText(`Total: $${(estimate.total_amount ?? 0).toFixed(2)}`, { x: margin, y, size: 12, font: fontBold })

    return pdfDoc.save()
}

router.get('/', async (req: Request, res: Response) => {
    try {
        const { accountNumber, status, page = 1, limit = 50 } = req.query
        const offset = (Number(page) - 1) * Number(limit)

        const where: any = {}
        if (accountNumber) where.account_number = accountNumber
        if (status) where.status = status

        const estimates = await prisma.estimate.findMany({
            where,
            skip: offset,
            take: Number(limit),
            orderBy: { date: 'desc' }
        })

        res.json(estimates.map((estimate) => ({
            ...estimate,
            items: parseItems(estimate.items)
        })))
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

router.get('/:estimateNumber', async (req: Request, res: Response) => {
    try {
        const estimate = await prisma.estimate.findUnique({
            where: { estimate_number: req.params.estimateNumber }
        })

        if (!estimate) {
            return res.status(404).json({ error: 'Estimate not found' })
        }

        res.json({
            ...estimate,
            items: parseItems(estimate.items)
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

router.get('/:estimateNumber/download', async (req: Request, res: Response) => {
    try {
        const estimate = await prisma.estimate.findUnique({
            where: { estimate_number: req.params.estimateNumber }
        })

        if (!estimate) {
            return res.status(404).json({ error: 'Estimate not found' })
        }

        const estimateData = {
            ...estimate,
            items: parseItems(estimate.items)
        }
        const pdfBytes = await createEstimatePdf(estimateData)
        const filename = `${estimate.estimate_number}.pdf`
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.send(Buffer.from(pdfBytes))
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            account_number,
            date,
            description,
            items,
            tax_rate,
            valid_until,
            status
        } = req.body

        const lineItems = parseItems(items).map((item: any) => ({
            description: item.description || '',
            qty: Number(item.qty) || 0,
            unitPrice: Number(item.unitPrice) || 0
        }))

        const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.qty * item.unitPrice, 0)
        const taxAmount = Number(tax_rate || 0) * subtotal / 100
        const totalAmount = subtotal + taxAmount

        const estimate_number = 'EST-' + Date.now().toString().slice(-10) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()

        const estimate = await prisma.estimate.create({
            data: {
                estimate_number,
                account_number,
                date,
                description,
                items: JSON.stringify(lineItems),
                subtotal,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                status: status || 'pending',
                valid_until: valid_until ? new Date(valid_until) : undefined
            }
        })

        res.status(201).json({
            ...estimate,
            items: lineItems
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router
