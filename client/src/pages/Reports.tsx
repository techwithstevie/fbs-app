import { Download, FileText } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

export function Reports() {
  const [selectedReport, setSelectedReport] = useState('')
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/${selectedReport}`)
      const data = await response.json()
      if (selectedReport === 'accounts-receivable' || selectedReport === 'service-history') {
        setReportData(data || [])
      } else if (selectedReport === 'aging') {
        setReportData(data.rows || [])
      } else {
        setReportData(data || [])
      }
    } catch (error) {
      console.error('Error generating report:', error)
      setReportData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Reports</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Report Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant={selectedReport === 'accounts-receivable' ? 'default' : 'outline'}
              onClick={() => setSelectedReport('accounts-receivable')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Accounts Receivable
            </Button>
            <Button
              variant={selectedReport === 'aging' ? 'default' : 'outline'}
              onClick={() => setSelectedReport('aging')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Aging Report
            </Button>
            <Button
              variant={selectedReport === 'customers-by-class' ? 'default' : 'outline'}
              onClick={() => setSelectedReport('customers-by-class')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Customers by Class Code
            </Button>
            <Button
              variant={selectedReport === 'customers-by-billing' ? 'default' : 'outline'}
              onClick={() => setSelectedReport('customers-by-billing')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Customers by Billing Code
            </Button>
            <Button
              variant={selectedReport === 'past-due' ? 'default' : 'outline'}
              onClick={() => setSelectedReport('past-due')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Past Due Accounts
            </Button>
            <Button
              variant={selectedReport === 'service-history' ? 'default' : 'outline'}
              onClick={() => setSelectedReport('service-history')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Service History
            </Button>
          </div>
          {selectedReport && (
            <div className="mt-4">
              <Button onClick={generateReport}>
                Generate Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {selectedReport.replace('-', ' ').toUpperCase()}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(reportData[0] || {}).map((key) => (
                        <th key={key} className="text-left py-3 px-4 font-medium">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="py-3 px-4">
                            {value !== null && value !== undefined ? String(value) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
