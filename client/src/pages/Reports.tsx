import { Download, FileText } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

const REPORTS: Record<string, { label: string; endpoint: string; filterLabel?: string; filterParam?: string }> = {
  'accounts-receivable': { label: 'Accounts Receivable', endpoint: '/api/reports/accounts-receivable' },
  aging: { label: 'Aging Report', endpoint: '/api/reports/aging' },
  'customers-by-class': { label: 'Customers by Class Code', endpoint: '/api/reports/customers/by-class-code', filterLabel: 'Class Code', filterParam: 'classCode' },
  'customers-by-billing': { label: 'Customers by Billing Code', endpoint: '/api/reports/customers/by-billing-code', filterLabel: 'Billing Code', filterParam: 'billingCode' },
  'past-due': { label: 'Past Due Accounts', endpoint: '/api/reports/past-due', filterLabel: 'Days Overdue', filterParam: 'days' },
  'service-history': { label: 'Service History', endpoint: '/api/reports/service-history' }
}

export function Reports() {
  const [selectedReport, setSelectedReport] = useState('')
  const [reportFilter, setReportFilter] = useState('')
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const escapeCsvValue = (value: any) => {
    const stringValue = value === null || value === undefined ? '' : String(value)
    const escaped = stringValue.replace(/"/g, '""')
    return `"${escaped}"`
  }

  const exportReport = () => {
    if (!selectedReport || reportData.length === 0) return
    const headers = Object.keys(reportData[0])
    const csvRows = [headers.join(',')]

    reportData.forEach((row) => {
      const values = headers.map((header) => {
        const value = (row as any)[header]
        return escapeCsvValue(value)
      })
      csvRows.push(values.join(','))
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${selectedReport}-report.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const generateReport = async () => {
    if (!selectedReport) return
    setLoading(true)
    try {
      const report = REPORTS[selectedReport]
      const params = new URLSearchParams()
      if (report.filterParam && reportFilter) {
        params.append(report.filterParam, reportFilter)
      }

      const url = `${report.endpoint}${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (selectedReport === 'aging') {
        setReportData(data.rows || [])
      } else if (selectedReport === 'service-history') {
        setReportData(data || [])
      } else {
        setReportData(Array.isArray(data) ? data : data || [])
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
              onClick={() => {
                setSelectedReport('accounts-receivable')
                setReportFilter('')
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Accounts Receivable
            </Button>
            <Button
              variant={selectedReport === 'aging' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedReport('aging')
                setReportFilter('')
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Aging Report
            </Button>
            <Button
              variant={selectedReport === 'customers-by-class' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedReport('customers-by-class')
                setReportFilter('')
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Customers by Class Code
            </Button>
            <Button
              variant={selectedReport === 'customers-by-billing' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedReport('customers-by-billing')
                setReportFilter('')
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Customers by Billing Code
            </Button>
            <Button
              variant={selectedReport === 'past-due' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedReport('past-due')
                setReportFilter('30')
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Past Due Accounts
            </Button>
            <Button
              variant={selectedReport === 'service-history' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedReport('service-history')
                setReportFilter('')
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Service History
            </Button>
          </div>
          {selectedReport && (
            <div className="mt-4 space-y-4">
              {REPORTS[selectedReport]?.filterLabel && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">{REPORTS[selectedReport].filterLabel}</label>
                  <Input
                    value={reportFilter}
                    onChange={(e) => setReportFilter(e.target.value)}
                    placeholder={REPORTS[selectedReport].filterLabel}
                    className="max-w-xs"
                  />
                </div>
              )}
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
              <Button variant="outline" size="sm" onClick={exportReport}>
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
