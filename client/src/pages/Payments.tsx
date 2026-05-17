import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Plus } from 'lucide-react'

interface Payment {
  id: string
  payment_number: string
  account_number: string
  date: string
  check_number?: string
  amount: number
  payment_type: string
}

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    account_number: '',
    date: new Date().toISOString().split('T')[0],
    check_number: '',
    amount: '',
    payment_type: 'check'
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      const data = await response.json()
      setPayments(data.payments || [])
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
          check_number: '',
          amount: '',
          payment_type: 'check'
        })
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Account Number"
              value={formData.account_number}
              onChange={(e) => setFormData({...formData, account_number: e.target.value})}
              required
            />
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
            <Input
              placeholder="Check Number"
              value={formData.check_number}
              onChange={(e) => setFormData({...formData, check_number: e.target.value})}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
            <select
              value={formData.payment_type}
              onChange={(e) => setFormData({...formData, payment_type: e.target.value})}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="check">Check</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit Card</option>
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
