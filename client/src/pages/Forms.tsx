import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { FileText, Download, Printer } from 'lucide-react'

export function Forms() {
  const [accountNumber, setAccountNumber] = useState('')
  const [formType, setFormType] = useState('')
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateForm = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/forms/${formType}/${accountNumber}`)
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      console.error('Error generating form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Forms & Certificates</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select Form Type</option>
              <option value="installation-cert">Certificate of Installation</option>
              <option value="monitoring-cert">Certificate of Monitoring</option>
              <option value="inspection-form">Inspection Form</option>
              <option value="central-station">Central Station Form</option>
              <option value="custom">Custom Form</option>
            </select>
            <Button onClick={generateForm}>
              <FileText className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {formData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {formType.replace('-', ' ').toUpperCase()}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 border rounded bg-white">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">FIRE & BURGLAR SECURITY</h2>
                    <p className="text-gray-600">Security Management System</p>
                  </div>

                  {formData.customer && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-medium">{formData.customer.account_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer Name</p>
                        <p className="font-medium">{formData.customer.business_name_1 || `${formData.customer.first_name_1} ${formData.customer.last_name_1}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{formData.customer.billing_address_1}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{formData.customer.business_phone_1}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-4">System Information</h3>
                    {formData.customer && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Class Code</p>
                          <p className="font-medium">{formData.customer.class_code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Panel Model</p>
                          <p className="font-medium">{formData.customer.panel_model || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Installation Date</p>
                          <p className="font-medium">{formData.customer.installation_date || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Central Station</p>
                          <p className="font-medium">{formData.customer.central_station || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-bold mb-4">Certification</h3>
                    <div className="grid grid-cols-2 gap-8 mt-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Technician Signature</p>
                        <div className="border-b-2 border-gray-400 h-8"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Date</p>
                        <div className="border-b-2 border-gray-400 h-8"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
