import { Edit, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

interface Customer {
  account_number: string
  business_name_1?: string
  first_name_1?: string
  last_name_1?: string
  class_code: string
  billing_address_1?: string
  business_phone_1?: string
  business_emails?: Array<{ email: string } | string>
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

  const exportCustomers = () => {
    if (customers.length === 0) return

    const headers = ['account_number', 'business_name_1', 'class_code', 'billing_address_1', 'business_phone_1', 'business_emails']
    const csvRows = [headers.join(',')]

    const escapeCsv = (value: any) => {
      const stringValue = value === null || value === undefined ? '' : String(value)
      const escaped = stringValue.replace(/"/g, '""')
      return `"${escaped}"`
    }

    customers.forEach((customer) => {
      const row = headers.map((key) => {
        const value = (customer as any)[key]
        if (Array.isArray(value)) {
          return escapeCsv(value.map((item) => typeof item === 'string' ? item : item.email).join('; '))
        }
        return escapeCsv(value)
      })
      csvRows.push(row.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'customers.csv'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const printCustomers = () => {
    const printWindow = window.open('', 'PRINT', 'width=900,height=700')
    if (!printWindow) return
    const html = `
      <html>
        <head>
          <title>Customers</title>
          <style>body{font-family:sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:left;}th{background:#f3f4f6;}</style>
        </head>
        <body>
          <h1>Customers</h1>
          <table>
            <thead>
              <tr>
                <th>Account #</th><th>Name</th><th>Class Code</th><th>Address</th><th>Phone</th><th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map((customer) => {
      const email = customer.business_emails && customer.business_emails[0] ? (typeof customer.business_emails[0] === 'string' ? customer.business_emails[0] : customer.business_emails[0].email) : '-'
      const name = customer.business_name_1 || `${customer.first_name_1 || ''} ${customer.last_name_1 || ''}`.trim()
      return `<tr><td>${customer.account_number}</td><td>${name}</td><td>${customer.class_code}</td><td>${customer.billing_address_1 || ''}</td><td>${customer.business_phone_1 || ''}</td><td>${email}</td></tr>`
    }).join('')}
            </tbody>
          </table>
        </body>
      </html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportCustomers}>
            Export
          </Button>
          <Button variant="outline" onClick={printCustomers}>
            Print
          </Button>
          <Link to="/customers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </Link>
        </div>
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
                <option value="name">Name</option>
                <option value="address">Address</option>
                <option value="telephone">Telephone</option>
                <option value="email">Email</option>
                <option value="starlink_number">Starlink Number</option>
                <option value="invoice_number">Invoice Number</option>
                <option value="system_type">System Type</option>
                <option value="class_code">Class Code</option>
                <option value="billing_code">Billing Code</option>
                <option value="zip">Zip Code</option>
                <option value="area_code">Area Code</option>
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
                          (() => {
                            const emailItem = customer.business_emails![0]
                            const email = typeof emailItem === 'string' ? emailItem : emailItem.email
                            return (
                              <a
                                href={`mailto:${email}?subject=${encodeURIComponent(`FBS Account ${customer.account_number}`)}`}
                                className="text-blue-600 hover:underline"
                              >
                                {email}
                              </a>
                            )
                          })()
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <Link to={`/customers/${customer.account_number}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/statements?accountNumber=${customer.account_number}&type=customer`}>
                          <Button variant="outline" size="sm">
                            Statement
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
