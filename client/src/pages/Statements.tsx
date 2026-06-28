import { Download, FileText } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function Statements() {
  const [accountNumber, setAccountNumber] = useState('')
  const [statementType, setStatementType] = useState('customer')
  const [statementData, setStatementData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateStatement = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/statements/${accountNumber}?type=${statementType}`)
      const data = await response.json()
      setStatementData(data)
    } catch (error) {
      console.error('Error generating statement:', error)
      setStatementData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Statements</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <select
              value={statementType}
              onChange={(e) => setStatementType(e.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="customer">Customer Statement</option>
              <option value="final">Final Statement</option>
            </select>
            <Button onClick={generateStatement}>
              <FileText className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {statementData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Statement for Account {accountNumber}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-medium">{statementData.customer?.business_name_1 || statementData.customer?.first_name_1 + ' ' + statementData.customer?.last_name_1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-medium">{statementData.customer?.account_number}</p>
                  </div>
                </div>

                {statementData.aging && (
                  <div className="grid grid-cols-5 gap-4 p-4 bg-blue-50 rounded">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">1-30 Days</p>
                      <p className="font-bold text-lg">${statementData.aging['1-30']?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">30-60 Days</p>
                      <p className="font-bold text-lg">${statementData.aging['30-60']?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">60-90 Days</p>
                      <p className="font-bold text-lg">${statementData.aging['60-90']?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">90-120 Days</p>
                      <p className="font-bold text-lg">${statementData.aging['90-120']?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Over 120 Days</p>
                      <p className="font-bold text-lg text-red-600">${statementData.aging['120+']?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                )}

                {statementData.invoices && statementData.invoices.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Description</th>
                          <th className="text-left py-3 px-4 font-medium">Amount</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statementData.invoices.map((invoice: any) => (
                          <tr key={invoice.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{invoice.invoice_number}</td>
                            <td className="py-3 px-4">{invoice.date}</td>
                            <td className="py-3 px-4">{invoice.description}</td>
                            <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
                            <td className="py-3 px-4">{invoice.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end p-4 bg-gray-50 rounded">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Due</p>
                    <p className="font-bold text-2xl">${statementData.total_due?.toFixed(2) || '0.00'}</p>
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
