import { Download, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

interface EstimateItem {
    description: string
    qty: string
    unitPrice: string
}

interface Estimate {
    id: number
    estimate_number: string
    account_number: string
    date: string
    description: string
    items: Array<{ description: string; qty: number; unitPrice: number }>
    subtotal: number
    tax_amount: number
    total_amount: number
    status: string
    valid_until?: string
}

export function Estimates() {
    const [estimates, setEstimates] = useState<Estimate[]>([])
    const [loading, setLoading] = useState(true)
    const [successMessage, setSuccessMessage] = useState('')
    const [formData, setFormData] = useState({
        account_number: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        valid_until: '',
        tax_rate: '0',
        status: 'pending'
    })
    const [items, setItems] = useState<EstimateItem[]>([
        { description: '', qty: '1', unitPrice: '0.00' }
    ])

    useEffect(() => {
        fetchEstimates()
    }, [])

    const fetchEstimates = async () => {
        try {
            const response = await fetch('/api/estimates')
            const data = await response.json()
            setEstimates(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching estimates:', error)
        } finally {
            setLoading(false)
        }
    }

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0), 0)
    }, [items])

    const taxAmount = useMemo(() => {
        return subtotal * (Number(formData.tax_rate) || 0) / 100
    }, [subtotal, formData.tax_rate])

    const totalAmount = subtotal + taxAmount

    const updateItem = (index: number, field: keyof EstimateItem, value: string) => {
        setItems((current) => current.map((item, idx) => idx === index ? { ...item, [field]: value } : item))
    }

    const addItem = () => setItems((current) => [...current, { description: '', qty: '1', unitPrice: '0.00' }])
    const removeItem = (index: number) => setItems((current) => current.filter((_, idx) => idx !== index))

    const createEstimate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/estimates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    items,
                    tax_rate: Number(formData.tax_rate)
                })
            })
            if (response.ok) {
                setSuccessMessage('Estimate created successfully.')
                setFormData({
                    account_number: '',
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    valid_until: '',
                    tax_rate: '0',
                    status: 'pending'
                })
                setItems([{ description: '', qty: '1', unitPrice: '0.00' }])
                fetchEstimates()
                setTimeout(() => setSuccessMessage(''), 3000)
            }
        } catch (error) {
            console.error('Error creating estimate:', error)
        }
    }

    const downloadEstimate = async (estimateNumber: string) => {
        try {
            const response = await fetch(`/api/estimates/${estimateNumber}/download`)
            if (!response.ok) {
                throw new Error('Failed to download estimate')
            }
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = `${estimateNumber}.pdf`
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading estimate:', error)
        }
    }

    const emailEstimate = (estimateNumber: string, accountNumber: string) => {
        const subject = encodeURIComponent(`FBS Estimate ${estimateNumber}`)
        const body = encodeURIComponent(`Please review estimate ${estimateNumber} for account ${accountNumber}.`)
        window.location.href = `mailto:?subject=${subject}&body=${body}`
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Estimates</h1>
            </div>

            {successMessage && (
                <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {successMessage}
                </div>
            )}

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Create Estimate</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={createEstimate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                placeholder="Account Number"
                                value={formData.account_number}
                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                required
                            />
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                            <Input
                                type="date"
                                placeholder="Valid Until"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Estimate Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="Tax Rate %"
                                value={formData.tax_rate}
                                onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="font-semibold">Line Items</div>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Item
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                        <Input
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            step="1"
                                            placeholder="Qty"
                                            value={item.qty}
                                            onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Unit Price"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                            <div className="rounded border border-gray-200 p-4">
                                <p className="font-medium">Subtotal</p>
                                <p>${subtotal.toFixed(2)}</p>
                            </div>
                            <div className="rounded border border-gray-200 p-4">
                                <p className="font-medium">Tax</p>
                                <p>${taxAmount.toFixed(2)}</p>
                            </div>
                            <div className="rounded border border-gray-200 p-4">
                                <p className="font-medium">Total</p>
                                <p>${totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                        <Button type="submit">Create Estimate</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Estimates</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : estimates.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No estimates found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">Estimate #</th>
                                        <th className="text-left py-3 px-4 font-medium">Account #</th>
                                        <th className="text-left py-3 px-4 font-medium">Date</th>
                                        <th className="text-left py-3 px-4 font-medium">Total</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estimates.map((estimate) => (
                                        <tr key={estimate.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">{estimate.estimate_number}</td>
                                            <td className="py-3 px-4">{estimate.account_number}</td>
                                            <td className="py-3 px-4">{estimate.date}</td>
                                            <td className="py-3 px-4">${estimate.total_amount.toFixed(2)}</td>
                                            <td className="py-3 px-4">{estimate.status}</td>
                                            <td className="py-3 px-4 flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => downloadEstimate(estimate.estimate_number)}>
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => emailEstimate(estimate.estimate_number, estimate.account_number)}>
                                                    Email
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
