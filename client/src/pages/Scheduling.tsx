import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Calendar, Plus, Bell } from 'lucide-react'

interface Reminder {
  id: string
  account_number: string
  reminder_type: string
  due_date: string
  description: string
  completed: boolean
}

export function Scheduling() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [formData, setFormData] = useState({
    account_number: '',
    reminder_type: 'inspection',
    due_date: '',
    description: ''
  })

  const addReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      ...formData,
      completed: false
    }
    setReminders([...reminders, newReminder])
    setFormData({
      account_number: '',
      reminder_type: 'inspection',
      due_date: '',
      description: ''
    })
  }

  const toggleComplete = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ))
  }

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id))
  }

  const upcomingReminders = reminders.filter(r => !r.completed)
  const completedReminders = reminders.filter(r => r.completed)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Scheduling & Reminders</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Account Number"
              value={formData.account_number}
              onChange={(e) => setFormData({...formData, account_number: e.target.value})}
            />
            <select
              value={formData.reminder_type}
              onChange={(e) => setFormData({...formData, reminder_type: e.target.value})}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="inspection">Fire Inspection</option>
              <option value="service">Service Call</option>
              <option value="renewal">Contract Renewal</option>
              <option value="payment">Payment Due</option>
              <option value="custom">Custom Reminder</option>
            </select>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            />
            <Button onClick={addReminder}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </div>
          <Input
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
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
            {upcomingReminders.length === 0 ? (
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
                      <span className={`px-2 py-1 rounded text-xs ${
                        new Date(reminder.due_date) < new Date() ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
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
