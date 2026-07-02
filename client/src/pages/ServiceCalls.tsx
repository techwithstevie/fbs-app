import { Check, Download, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

interface ServiceCall {
  id: string
  service_call_number: string
  account_number: string
  date: string
  issue_code: string
  special_message?: string
  issue_description?: string
  custom_problem?: string
  labor_hours: number
  parts_cost: number
  completed: boolean
}

export function ServiceCalls() {
  const [searchParams] = useSearchParams()
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    account_number: '',
    date: new Date().toISOString().split('T')[0],
    special_message: '',
    issue_code: '',
    issue_description: '',
    custom_problem: '',
    labor_hours: '',
    parts_cost: ''
  })

  useEffect(() => {
    fetchServiceCalls()
    const account = searchParams.get('accountNumber')
    if (account) {
      setFormData(prev => ({ ...prev, account_number: account }))
    }
  }, [searchParams])

  const fetchServiceCalls = async () => {
    try {
      const response = await fetch('/api/service-calls')
      const data = await response.json()
      setServiceCalls(Array.isArray(data) ? data : data.serviceCalls || [])
    } catch (error) {
      console.error('Error fetching service calls:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/service-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          labor_hours: Number(formData.labor_hours || 0),
          parts_cost: Number(formData.parts_cost || 0)
        })
      })
      if (response.ok) {
        fetchServiceCalls()
        setFormData({
          account_number: '',
          date: new Date().toISOString().split('T')[0],
          special_message: '',
          issue_code: '',
          issue_description: '',
          custom_problem: '',
          labor_hours: '',
          parts_cost: ''
        })
        setSuccessMessage('Service call created successfully.')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error creating service call:', error)
    }
  }

  const markComplete = async (id: string) => {
    try {
      const response = await fetch(`/api/service-calls/${id}/complete`, { method: 'PUT' })
      if (response.ok) {
        fetchServiceCalls()
      }
    } catch (error) {
      console.error('Error marking service call complete:', error)
    }
  }

  const deleteServiceCall = async (id: string) => {
    if (!window.confirm('Delete this service call? This action cannot be undone.')) {
      return
    }
    try {
      const response = await fetch(`/api/service-calls/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchServiceCalls()
      }
    } catch (error) {
      console.error('Error deleting service call:', error)
    }
  }

  const downloadServiceCall = async (serviceCallNumber: string) => {
    try {
      const response = await fetch(`/api/service-calls/${serviceCallNumber}/download`)
      if (!response.ok) {
        throw new Error('Failed to download service call')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${serviceCallNumber}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading service call:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Service Calls</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Service Call</CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              placeholder="Special Message"
              value={formData.special_message}
              onChange={(e) => setFormData({ ...formData, special_message: e.target.value })}
            />
            <select
              value={formData.issue_code}
              onChange={(e) => setFormData({ ...formData, issue_code: e.target.value })}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              required
            >
              <option value="">Select Issue</option>
              <option value="1">No green light</option>
              <option value="2">Low battery</option>
              <option value="3">Failure to communicate</option>
              <option value="4">Fire Alarm falsed</option>
              <option value="10">System changes at expense</option>
              <option value="49">Custom problem</option>
              <option value="99">Notes</option>
            </select>
            <Input
              placeholder="Description"
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              className="md:col-span-2"
            />
            {formData.issue_code === '49' && (
              <Input
                placeholder="Custom Problem"
                value={formData.custom_problem}
                onChange={(e) => setFormData({ ...formData, custom_problem: e.target.value })}
                className="md:col-span-2"
              />
            )}
            <Input
              type="number"
              step="0.5"
              placeholder="Labor Hours"
              value={formData.labor_hours}
              onChange={(e) => setFormData({ ...formData, labor_hours: e.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Parts Cost"
              value={formData.parts_cost}
              onChange={(e) => setFormData({ ...formData, parts_cost: e.target.value })}
            />
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Create Service Call
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : serviceCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No service calls found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Account #</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Issue</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">Labor Hours</th>
                    <th className="text-left py-3 px-4 font-medium">Parts Cost</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCalls.map((call) => (
                    <tr key={call.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{call.account_number}</td>
                      <td className="py-3 px-4">{call.date}</td>
                      <td className="py-3 px-4">{call.issue_code}</td>
                      <td className="py-3 px-4">{call.special_message || call.issue_description || (call.custom_problem ? `Custom: ${call.custom_problem}` : '')}</td>
                      <td className="py-3 px-4">{call.labor_hours}</td>
                      <td className="py-3 px-4">${call.parts_cost.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        {call.completed ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Completed</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        {!call.completed && (
                          <Button variant="outline" size="sm" onClick={() => markComplete(call.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => downloadServiceCall(call.service_call_number)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteServiceCall(call.service_call_number)}>
                          <Trash2 className="w-4 h-4" />
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
