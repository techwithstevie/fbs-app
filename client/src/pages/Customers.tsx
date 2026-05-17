import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Search, Plus, Edit } from 'lucide-react'

interface Customer {
  account_number: string
  business_name_1?: string
  first_name_1?: string
  last_name_1?: string
  class_code: string
  billing_address_1?: string
  business_phone_1?: string
  business_emails?: { email: string }[]
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchField, setSearchField] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) {
        params.append('search', searchTerm)
        params.append('field', searchField === 'all' ? '' : searchField)
      }
      const response = await fetch(`/api/customers?${params}`)
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error searching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Link to="/customers/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mr-2"
              >
                <option value="all">All Fields</option>
                <option value="account_number">Account Number</option>
                <option value="business_name_1">Business Name</option>
                <option value="last_name_1">Last Name</option>
                <option value="billing_address_1">Address</option>
                <option value="business_phone_1">Phone</option>
                <option value="business_emails">Email</option>
              </select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No customers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Account #</th>
                    <th className="text-left py-3 px-4 font-medium">Name/Business</th>
                    <th className="text-left py-3 px-4 font-medium">Class Code</th>
                    <th className="text-left py-3 px-4 font-medium">Address</th>
                    <th className="text-left py-3 px-4 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.account_number} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{customer.account_number}</td>
                      <td className="py-3 px-4">
                        {customer.business_name_1 || 
                         `${customer.first_name_1} ${customer.last_name_1}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {customer.class_code}
                        </span>
                      </td>
                      <td className="py-3 px-4">{customer.billing_address_1}</td>
                      <td className="py-3 px-4">{customer.business_phone_1}</td>
                      <td className="py-3 px-4">
                        {customer.business_emails && customer.business_emails[0] ? (
                          <a href={`mailto:${customer.business_emails[0].email}`} className="text-blue-600 hover:underline">
                            {customer.business_emails[0].email}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Link to={`/customers/${customer.account_number}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
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
