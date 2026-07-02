import { Download, FileText, Printer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function Statements() {
  const [searchParams] = useSearchParams()
  const [accountNumber, setAccountNumber] = useState('')
  const [statementType, setStatementType] = useState('customer')
  const [statementData, setStatementData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const statementRef = useRef<HTMLDivElement>(null)

  const customerName = statementData?.customer
    ? statementData.customer.business_name_1 || [statementData.customer.first_name_1, statementData.customer.last_name_1].filter(Boolean).join(' ')
    : '-'

  const customerAddress = statementData?.customer?.billing_address_1 || statementData?.customer?.business_address_1 || '-'
  const statementLabel = statementType === 'final' ? 'Final Statement' : 'Customer Statement'

  const generateStatement = async (account = accountNumber, type = statementType) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/statements/${account}?type=${type}`)
      const data = await response.json()
      setStatementData(data)
    } catch (error) {
      console.error('Error generating statement:', error)
      setStatementData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const account = searchParams.get('accountNumber') || ''
    const type = searchParams.get('type') || 'customer'
    setAccountNumber(account)
    setStatementType(type)
    if (account) {
      generateStatement(account, type)
    }
  }, [searchParams])

  const printStatement = () => {
    if (statementRef.current) {
      const printWindow = window.open('', 'PRINT', 'width=800,height=600')
      if (printWindow) {
        printWindow.document.write('<html><head><title>Statement</title>')
        printWindow.document.write('<style>body{font-family:sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{padding:8px;border:1px solid #ddd;text-align:left;}h1,h2,h3{margin:0 0 12px;} .summary{margin-top:16px;}</style>')
        printWindow.document.write('</head><body>')
        printWindow.document.write(statementRef.current.innerHTML)
        printWindow.document.write('</body></html>')
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
      }
    }
  }

  const downloadStatement = async () => {
    try {
      const response = await fetch(`/api/reports/statements/${accountNumber}/download?type=${statementType}`)
      if (!response.ok) {
        throw new Error('Failed to download statement')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${accountNumber}-statement-${statementType}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading statement:', error)
    }
  }

  const emailStatement = () => {
    const subject = encodeURIComponent(`FBS Statement for Account ${accountNumber}`)
    const body = encodeURIComponent(`Please review the statement generated for account ${accountNumber}.\n\nYou can download it from the FBS portal or attach the printed statement.`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
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
            <Button onClick={() => generateStatement()}>
              <FileText className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {statementData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <span>Statement for Account {accountNumber}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={printStatement}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadStatement}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={emailStatement}>
                    Email
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600">{statementLabel}</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                <div ref={statementRef}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-medium">{customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="font-medium">{statementData.customer?.account_number || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{customerAddress}</p>
                    </div>
                  </div>

                  {statementData.aging && (
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-4 bg-blue-50 rounded">
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

                  {statementData.payments && statementData.payments.length > 0 && (
                    <div className="mt-6 overflow-x-auto">
                      <h3 className="text-lg font-semibold mb-3">Payments</h3>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Amount</th>
                            <th className="text-left py-3 px-4 font-medium">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statementData.payments.map((payment: any) => (
                            <tr key={payment.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{payment.date}</td>
                              <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
                              <td className="py-3 px-4">{payment.payment_type || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex justify-end p-4 bg-gray-50 rounded">
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Total Due</p>
                        <p className="font-bold text-2xl">${statementData.summary?.total_due?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payments Received</p>
                        <p className="font-medium">${statementData.summary?.total_paid?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Balance Due</p>
                        <p className="font-bold text-2xl text-red-600">${statementData.summary?.grand_total?.toFixed(2) || '0.00'}</p>
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
