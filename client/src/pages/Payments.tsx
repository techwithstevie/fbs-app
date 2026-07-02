import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

interface Payment {
  id: string
  payment_number: string
  account_number: string
  date: string
  invoice_number?: string
  check_number?: string
  deposit_date?: string
  amount: number
  payment_type: string
}

export function Payments() {
  const [searchParams] = useSearchParams()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    account_number: '',
    date: new Date().toISOString().split('T')[0],
    invoice_number: '',
    check_number: '',
    deposit_date: '',
    amount: '',
    payment_type: 'service'
  })

  useEffect(() => {
    fetchPayments()
    const account = searchParams.get('accountNumber')
    if (account) {
      setFormData(prev => ({ ...prev, account_number: account }))
    }
  }, [searchParams])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      const data = await response.json()
      setPayments(Array.isArray(data) ? data : data.payments || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        fetchPayments()
        setFormData({
          account_number: '',
          date: new Date().toISOString().split('T')[0],
          invoice_number: '',
          check_number: '',
          deposit_date: '',
          amount: '',
          payment_type: 'service'
        })
        setSuccessMessage('Payment posted successfully.')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error posting payment:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Payments</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Post Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              placeholder="Invoice Number"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
            />
            <Input
              placeholder="Check Number"
              value={formData.check_number}
              onChange={(e) => setFormData({ ...formData, check_number: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Deposit Date"
              value={formData.deposit_date}
              onChange={(e) => setFormData({ ...formData, deposit_date: e.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <select
              value={formData.payment_type}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="service">Service</option>
              <option value="monitoring">Monitoring</option>
              <option value="tax_exempt">Tax Exempt</option>
              <option value="taxable">Taxable</option>
              <option value="sale">Sale</option>
              <option value="deposit">Deposit</option>
            </select>
            <Button type="submit" className="md:col-span-3">
              <Plus className="w-4 h-4 mr-2" />
              Post Payment
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Payment #</th>
                    <th className="text-left py-3 px-4 font-medium">Account #</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium">Deposit Date</th>
                    <th className="text-left py-3 px-4 font-medium">Check #</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{payment.payment_number}</td>
                      <td className="py-3 px-4">{payment.account_number}</td>
                      <td className="py-3 px-4">{payment.date}</td>
                      <td className="py-3 px-4">{payment.invoice_number || '-'}</td>
                      <td className="py-3 px-4">{payment.deposit_date || '-'}</td>
                      <td className="py-3 px-4">{payment.check_number || '-'}</td>
                      <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">{payment.payment_type}</td>
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
