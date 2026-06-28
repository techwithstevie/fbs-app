import { Bell, Calendar, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

interface Reminder {
  id: number
  account_number: string
  reminder_type: string
  due_date: string
  description: string
  completed: boolean
}

const REMINDER_TYPES = [
  { value: 'inspection', label: 'Fire Inspection' },
  { value: 'service', label: 'Service Call' },
  { value: 'renewal', label: 'Contract Renewal' },
  { value: 'payment', label: 'Payment Due' },
  { value: 'custom', label: 'Custom Reminder' }
]

export function Scheduling() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    account_number: '',
    reminder_type: 'inspection',
    due_date: '',
    description: ''
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/scheduling')
      const data = await response.json()
      setReminders(data || [])
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const addReminder = async () => {
    try {
      const response = await fetch('/api/scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const reminder = await response.json()
        setReminders((current) => [reminder, ...current])
        setFormData({
          account_number: '',
          reminder_type: 'inspection',
          due_date: '',
          description: ''
        })
        setSuccessMessage('Reminder saved successfully.')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving reminder:', error)
    }
  }

  const toggleComplete = async (id: number) => {
    try {
      const response = await fetch(`/api/scheduling/${id}/complete`, { method: 'PUT' })
      if (response.ok) {
        const updated = await response.json()
        setReminders((current) => current.map((r) => (r.id === updated.id ? updated : r)))
      }
    } catch (error) {
      console.error('Error toggling reminder complete:', error)
    }
  }

  const deleteReminder = async (id: number) => {
    try {
      const response = await fetch(`/api/scheduling/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setReminders((current) => current.filter((r) => r.id !== id))
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const upcomingReminders = reminders.filter((r) => !r.completed)
  const completedReminders = reminders.filter((r) => r.completed)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Scheduling & Reminders</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Account Number"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            />
            <select
              value={formData.reminder_type}
              onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value })}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {REMINDER_TYPES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
            <Button onClick={addReminder}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </div>
          <Input
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-4"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" />
              Upcoming Reminders
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                {upcomingReminders.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : upcomingReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No upcoming reminders</div>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="p-4 border rounded hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{reminder.reminder_type.replace('-', ' ').toUpperCase()}</p>
                        <p className="text-sm text-gray-600">Account: {reminder.account_number}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${new Date(reminder.due_date) < new Date() ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {reminder.due_date}
                      </span>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => toggleComplete(reminder.id)}>
                        Mark Complete
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteReminder(reminder.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Completed
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                {completedReminders.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No completed reminders</div>
            ) : (
              <div className="space-y-3">
                {completedReminders.map((reminder) => (
                  <div key={reminder.id} className="p-4 border rounded bg-gray-50 opacity-75">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium line-through">{reminder.reminder_type.replace('-', ' ').toUpperCase()}</p>
                        <p className="text-sm text-gray-600">Account: {reminder.account_number}</p>
                      </div>
                      <span className="text-sm text-gray-500">{reminder.due_date}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleComplete(reminder.id)}>
                      Mark Incomplete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
