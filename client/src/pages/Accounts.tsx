import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function Accounts() {
    const [criteria, setCriteria] = useState({
        accountNumber: '',
        name: '',
        classCode: '',
        systemType: '',
        city: '',
        centralStation: '',
        monitoringAgreementOnFile: false,
        dateInstalledFrom: '',
        dateInstalledTo: ''
    })
    const [updateType, setUpdateType] = useState<'percentage' | 'fixed'>('percentage')
    const [updateValue, setUpdateValue] = useState('')
    const [taxRate, setTaxRate] = useState('')
    const [taxExemptOnly, setTaxExemptOnly] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const updateBilling = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/accounts/update-billing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    criteria,
                    updateType,
                    value: Number(updateValue)
                })
            })

            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error('Error updating billing:', error)
            setResult({ error: 'Failed to update billing' })
        } finally {
            setLoading(false)
        }
    }

    const updateTaxRate = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/accounts/update-tax-rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taxRate: Number(taxRate),
                    criteria: { ...criteria, taxExemptOnly }
                })
            })

            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error('Error updating tax rate:', error)
            setResult({ error: 'Failed to update tax rate' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Accounts</h1>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Bulk Billing Update</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Input
                            placeholder="Account Number"
                            value={criteria.accountNumber}
                            onChange={(e) => setCriteria({ ...criteria, accountNumber: e.target.value })}
                        />
                        <Input
                            placeholder="Customer Name"
                            value={criteria.name}
                            onChange={(e) => setCriteria({ ...criteria, name: e.target.value })}
                        />
                        <Input
                            placeholder="Class Code"
                            value={criteria.classCode}
                            onChange={(e) => setCriteria({ ...criteria, classCode: e.target.value })}
                        />
                        <Input
                            placeholder="System Type"
                            value={criteria.systemType}
                            onChange={(e) => setCriteria({ ...criteria, systemType: e.target.value })}
                        />
                        <Input
                            placeholder="City"
                            value={criteria.city}
                            onChange={(e) => setCriteria({ ...criteria, city: e.target.value })}
                        />
                        <Input
                            placeholder="Central Station"
                            value={criteria.centralStation}
                            onChange={(e) => setCriteria({ ...criteria, centralStation: e.target.value })}
                        />
                        <Input
                            type="date"
                            placeholder="Installed After"
                            value={criteria.dateInstalledFrom}
                            onChange={(e) => setCriteria({ ...criteria, dateInstalledFrom: e.target.value })}
                        />
                        <Input
                            type="date"
                            placeholder="Installed Before"
                            value={criteria.dateInstalledTo}
                            onChange={(e) => setCriteria({ ...criteria, dateInstalledTo: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={criteria.monitoringAgreementOnFile}
                                onChange={(e) => setCriteria({ ...criteria, monitoringAgreementOnFile: e.target.checked })}
                                className="h-5 w-5 rounded border-gray-300"
                            />
                            Monitoring agreement on file
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <select
                            value={updateType}
                            onChange={(e) => setUpdateType(e.target.value as 'percentage' | 'fixed')}
                            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        >
                            <option value="percentage">Update by Percentage</option>
                            <option value="fixed">Set Fixed Value</option>
                        </select>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder={updateType === 'percentage' ? 'Percentage' : 'Fixed amount'}
                            value={updateValue}
                            onChange={(e) => setUpdateValue(e.target.value)}
                        />
                        <Button onClick={updateBilling} disabled={loading || !updateValue}>
                            {loading ? 'Working...' : 'Apply Billing Update'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Sales Tax Rate Update</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="Sales Tax Rate %"
                            value={taxRate}
                            onChange={(e) => setTaxRate(e.target.value)}
                        />
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={taxExemptOnly}
                                onChange={(e) => setTaxExemptOnly(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300"
                            />
                            Tax exempt customers only
                        </label>
                        <Button onClick={updateTaxRate} disabled={loading || !taxRate}>
                            {loading ? 'Working...' : 'Update Tax Rate'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">{JSON.stringify(result, null, 2)}</pre>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
