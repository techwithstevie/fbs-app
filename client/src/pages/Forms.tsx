import { Download, FileText, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

const DOCUMENT_TEMPLATES = [
  { value: 'J10-FireAlarm-Completion-Report.pdf', label: 'Fire Alarm Completion Report' },
  { value: 'lighting-cert.pdf', label: 'Lighting Certificate' },
  { value: 'monitoring-agreement.pdf', label: 'Monitoring Agreement' },
  { value: 'service-agreement.pdf', label: 'Service Agreement' }
]

export function Forms() {
  const [searchParams] = useSearchParams()
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

  const downloadFormPdf = async () => {
    if (!formType || !accountNumber) return
    try {
      const response = await fetch(`/api/forms/${formType}/${accountNumber}/download`)
      if (!response.ok) throw new Error('Failed to download form PDF')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${formType}-${accountNumber}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading form PDF:', error)
    }
  }

  const emailForm = () => {
    if (!formType || !accountNumber) return
    const subject = encodeURIComponent(`FBS ${formType.replace('-', ' ')} for Account ${accountNumber}`)
    const body = encodeURIComponent(`Please review the attached ${formType.replace('-', ' ')} for account ${accountNumber}.`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  useEffect(() => {
    const account = searchParams.get('accountNumber') || ''
    setAccountNumber(account)
  }, [searchParams])

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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Document Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENT_TEMPLATES.map((doc) => (
              <a
                key={doc.value}
                href={`/api/docs/${doc.value}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{doc.label}</p>
                    <p className="text-sm text-gray-500">{doc.value}</p>
                  </div>
                  <Download className="w-5 h-5 text-gray-500" />
                </div>
              </a>
            ))}
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
                <Button variant="outline" size="sm" onClick={downloadFormPdf}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" onClick={emailForm}>
                  Email
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
