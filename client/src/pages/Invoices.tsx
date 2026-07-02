import { Download, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

interface Invoice {
  id: string
  invoice_number: string
  account_number: string
  date: string
  description: string
  amount: number
  status: string
}

interface InvoiceFormData {
  account_number: string
  date: string
  description: string
  amount: string
  invoice_type: string
  tax_exempt: boolean
  sales_tax_rate: string
}

export function Invoices() {
  const [searchParams] = useSearchParams()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormData>({
    account_number: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    invoice_type: 'service',
    tax_exempt: false,
    sales_tax_rate: '0'
  })
  const [monthlyBilling, setMonthlyBilling] = useState({
    startAccount: '',
    endAccount: '',
    taxRate: '0',
    billingMonth: new Date().getMonth() + 1,
    billingYear: new Date().getFullYear()
  })

  useEffect(() => {
    fetchInvoices()
    const account = searchParams.get('accountNumber')
    if (account) {
      setInvoiceForm(prev => ({ ...prev, account_number: account }))
    }
  }, [searchParams])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      const data = await response.json()
      setInvoices(Array.isArray(data) ? data : data.invoices || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyBilling = async () => {
    try {
      const response = await fetch('/api/invoices/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startAccount: monthlyBilling.startAccount,
          endAccount: monthlyBilling.endAccount,
          taxRate: Number(monthlyBilling.taxRate),
          billingMonth: Number(monthlyBilling.billingMonth),
          billingYear: Number(monthlyBilling.billingYear)
        })
      })
      if (response.ok) {
        fetchInvoices()
        setSuccessMessage('Monthly billing generated successfully.')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error generating monthly billing:', error)
    }
  }

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoiceForm,
          amount: Number(invoiceForm.amount),
          tax_exempt: invoiceForm.tax_exempt,
          sales_tax_rate: Number(invoiceForm.sales_tax_rate)
        })
      })

      if (response.ok) {
        setSuccessMessage('Invoice created successfully.')
        setInvoiceForm({
          account_number: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: '',
          invoice_type: 'service',
          tax_exempt: false,
          sales_tax_rate: '0'
        })
        fetchInvoices()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  const downloadInvoice = async (invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceNumber}/download`)
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${invoiceNumber}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
    }
  }

  const emailInvoice = (invoice: Invoice) => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoice_number}`)
    const body = encodeURIComponent(`Please find invoice ${invoice.invoice_number} for account ${invoice.account_number}.\n\nThank you.`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invoices</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Monthly Billing</h3>
              <p className="text-sm text-gray-600">Generate invoices for recurring billing.</p>
            </div>
            <Button onClick={generateMonthlyBilling}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Monthly Billing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Start Account"
              value={monthlyBilling.startAccount}
              onChange={(e) => setMonthlyBilling({ ...monthlyBilling, startAccount: e.target.value })}
            />
            <Input
              placeholder="End Account"
              value={monthlyBilling.endAccount}
              onChange={(e) => setMonthlyBilling({ ...monthlyBilling, endAccount: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Tax Rate %"
              value={monthlyBilling.taxRate}
              onChange={(e) => setMonthlyBilling({ ...monthlyBilling, taxRate: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Billing Month"
              value={monthlyBilling.billingMonth}
              min={1}
              max={12}
              onChange={(e) => setMonthlyBilling({ ...monthlyBilling, billingMonth: Number(e.target.value) })}
            />
            <Input
              type="number"
              placeholder="Billing Year"
              value={monthlyBilling.billingYear}
              onChange={(e) => setMonthlyBilling({ ...monthlyBilling, billingYear: Number(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      {successMessage && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Create Invoice</h3>
              <p className="text-sm text-gray-600">Create an invoice for a customer account.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={createInvoice} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Account Number"
              value={invoiceForm.account_number}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, account_number: e.target.value })}
              required
            />
            <Input
              type="date"
              value={invoiceForm.date}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={invoiceForm.description}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
              required
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
              required
            />
            <Input
              placeholder="Sales Tax Rate %"
              type="number"
              step="0.01"
              value={invoiceForm.sales_tax_rate}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, sales_tax_rate: e.target.value })}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={invoiceForm.tax_exempt}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_exempt: e.target.checked })}
                />
                <span className="text-sm">Tax Exempt</span>
              </label>
            </div>
            <select
              value={invoiceForm.invoice_type}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_type: e.target.value })}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="service">Service</option>
              <option value="monitoring">Monitoring</option>
              <option value="sale">Sale</option>
              <option value="deposit">Deposit</option>
            </select>
            <Button type="submit" className="md:col-span-3">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No invoices found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium">Account #</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{invoice.invoice_number}</td>
                      <td className="py-3 px-4">{invoice.account_number}</td>
                      <td className="py-3 px-4">{invoice.date}</td>
                      <td className="py-3 px-4">{invoice.description}</td>
                      <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice.invoice_number)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => emailInvoice(invoice)}>
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
