import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'

const CLASS_CODE_DESCRIPTIONS: Record<string, Record<string, string>> = {
  status: {
    '1': 'Lease w/ monitoring',
    '2': 'Lease no monitoring',
    '3': 'Monitoring and Service – no charge for service',
    '4': 'Service Only',
    '5': 'Monitoring only',
    '6': 'FBS Installed -- higher service call fee and hourly rate',
    '7': 'FBS Modified',
    '8': 'FBS Has Serviced -- higher service call fee and hourly rate',
    '9': 'FBS Acquisition'
  },
  type: {
    '1': 'Commercial',
    '2': 'Residential',
    '3': 'Municipal/Government',
    '4': 'Billing'
  },
  system: {
    '1': 'Burglar and Fire Alarm',
    '2': 'Burglar Alarm Only',
    '3': 'Fire Alarm',
    '4': 'Access Control',
    '5': 'Integrated System',
    '6': 'Audio System',
    '7': 'Multiple Systems',
    '8': 'Custom'
  }
}

const BILLING_CODES: Record<string, string> = {
  '1': 'Annually in January',
  '2': 'Annually in February',
  '3': 'Annually in March',
  '4': 'Annually in April',
  '5': 'Annually in May',
  '6': 'Annually in June',
  '7': 'Annually in July',
  '8': 'Annually in August',
  '9': 'Annually in September',
  '10': 'Annually in October',
  '11': 'Annually in November',
  '12': 'Annually in December',
  '13': 'Quarterly (Jan, Apr, Jul, Oct)',
  '14': 'Quarterly (Feb, May, Aug, Nov)',
  '15': 'Quarterly (Mar, Jun, Sep, Dec)',
  '16': 'Monthly',
  '41': 'Semi-annually (January)',
  '42': 'Semi-annually (February)',
  '43': 'Semi-annually (March)',
  '44': 'Semi-annually (April)',
  '45': 'Semi-annually (May)',
  '46': 'Semi-annually (June)',
  '77': 'Billed on other account number',
  '88': 'Billed monthly on credit card',
  '99': 'Free – No charge'
}

interface Email {
  email: string
  description: string
}

interface FormData {
  account_number: string
  class_code: string
  class_description?: string
  business_name_1: string
  business_name_2: string
  business_address_1: string
  business_address_2: string
  business_phone_1: string
  business_phone_1_desc: string
  business_phone_2: string
  business_phone_2_desc: string
  business_emails: Email[]
  billing_name_1: string
  billing_name_2: string
  billing_address_1: string
  billing_address_2: string
  billing_address_3: string
  billing_phone_1: string
  billing_phone_1_desc: string
  billing_phone_2: string
  billing_phone_2_desc: string
  billing_phone_3: string
  billing_phone_3_desc: string
  billing_emails: Email[]
  last_name_1: string
  last_name_2: string
  first_name_1: string
  first_name_2: string
  contact_1_name: string
  contact_2_name: string
  home_phone_1: string
  home_phone_2: string
  cell_phone_1: string
  cell_phone_1_desc: string
  cell_phone_2: string
  cell_phone_2_desc: string
  cell_phone_3: string
  cell_phone_3_desc: string
  personal_emails: Email[]
  billing_code: string
  billing_description?: string
  billing_amount: string
  service_call_rate: string
  hourly_labor_rate: string
  discount_percent: string
  discount_reason: string
  installation_date: string
  installing_company: string
  access_codes: string
  panel_model: string
  panel_location: string
  transformer_location: string
  panel_codes: string
  panel_phone: string
  zone_list: string
  starlink_model: string
  starlink_number: string
  central_station: string
  central_station_account: string
  central_station_password: string
  last_fire_inspection_date: string
  last_nfpa_form_on_file: boolean
  last_service_date: string
  last_service_description: string
  custom_comments: string
  custom_notes: string
  monitoring_agreement_on_file: boolean
}

export function CustomerForm() {
  const { accountNumber } = useParams()
  const navigate = useNavigate()
  const isEditing = !!accountNumber
  const [loading, setLoading] = useState(isEditing)
  const [errors, setErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState<FormData>({
    account_number: '',
    class_code: '',
    business_name_1: '',
    business_name_2: '',
    business_address_1: '',
    business_address_2: '',
    business_phone_1: '',
    business_phone_1_desc: '',
    business_phone_2: '',
    business_phone_2_desc: '',
    business_emails: [],
    billing_name_1: '',
    billing_name_2: '',
    billing_address_1: '',
    billing_address_2: '',
    billing_address_3: '',
    billing_phone_1: '',
    billing_phone_1_desc: '',
    billing_phone_2: '',
    billing_phone_2_desc: '',
    billing_phone_3: '',
    billing_phone_3_desc: '',
    billing_emails: [],
    last_name_1: '',
    last_name_2: '',
    first_name_1: '',
    first_name_2: '',
    contact_1_name: '',
    contact_2_name: '',
    home_phone_1: '',
    home_phone_2: '',
    cell_phone_1: '',
    cell_phone_1_desc: '',
    cell_phone_2: '',
    cell_phone_2_desc: '',
    cell_phone_3: '',
    cell_phone_3_desc: '',
    personal_emails: [],
    billing_code: '',
    billing_amount: '',
    service_call_rate: '',
    hourly_labor_rate: '',
    discount_percent: '',
    discount_reason: '',
    installation_date: '',
    installing_company: '',
    access_codes: '',
    panel_model: '',
    panel_location: '',
    transformer_location: '',
    panel_codes: '',
    panel_phone: '',
    zone_list: '',
    starlink_model: '',
    starlink_number: '',
    central_station: '',
    central_station_account: '',
    central_station_password: '',
    last_fire_inspection_date: '',
    last_nfpa_form_on_file: false,
    last_service_date: '',
    last_service_description: '',
    custom_comments: '',
    custom_notes: '',
    monitoring_agreement_on_file: false
  })

  useEffect(() => {
    if (!isEditing) {
      fetchNextAccountNumber()
    } else {
      fetchCustomer()
    }
  }, [accountNumber])

  const fetchNextAccountNumber = async () => {
    try {
      const response = await fetch('/api/customers/next-account-number/available')
      const data = await response.json()
      setFormData(prev => ({ ...prev, account_number: data.nextAccountNumber }))
    } catch (error) {
      console.error('Error fetching next account number:', error)
    }
  }

  const fetchCustomer = async () => {
    const parseEmailArray = (value: any): Email[] => {
      if (!value) return []
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      }
      return []
    }

    try {
      const response = await fetch(`/api/customers/${accountNumber}`)
      const data = await response.json()
      setFormData({
        ...data,
        billing_amount: data.billing_amount != null ? String(data.billing_amount) : '',
        service_call_rate: data.service_call_rate != null ? String(data.service_call_rate) : '',
        hourly_labor_rate: data.hourly_labor_rate != null ? String(data.hourly_labor_rate) : '',
        discount_percent: data.discount_percent != null ? String(data.discount_percent) : '',
        business_emails: parseEmailArray(data.business_emails),
        billing_emails: parseEmailArray(data.billing_emails),
        personal_emails: parseEmailArray(data.personal_emails),
        last_nfpa_form_on_file: Boolean(data.last_nfpa_form_on_file),
        monitoring_agreement_on_file: Boolean(data.monitoring_agreement_on_file)
      })
    } catch (error) {
      console.error('Error fetching customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleClassCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value
    const status = CLASS_CODE_DESCRIPTIONS.status[code[0] || ''] || ''
    const type = CLASS_CODE_DESCRIPTIONS.type[code[1] || ''] || ''
    const system = CLASS_CODE_DESCRIPTIONS.system[code[2] || ''] || ''
    setFormData(prev => ({
      ...prev,
      class_code: code,
      class_description: `${status} ${type} ${system}`.trim()
    }))
  }

  const handleBillingCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setFormData(prev => ({
      ...prev,
      billing_code: code,
      billing_description: BILLING_CODES[code] || ''
    }))
  }

  const addEmail = (type: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...(prev[type] as Email[]), { email: '', description: '' }]
    }))
  }

  const updateEmail = (type: keyof FormData, index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: (prev[type] as Email[]).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeEmail = (type: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: (prev[type] as Email[]).filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const nextErrors: string[] = []

    if (!formData.account_number.match(/^\d{1,10}$/)) {
      nextErrors.push('Account number must be 1-10 digits.')
    }

    if (!formData.class_code.match(/^\d{4}$/)) {
      nextErrors.push('Class code must be exactly 4 digits.')
    }

    if (!formData.billing_code.match(/^\d{1,3}$/)) {
      nextErrors.push('Billing code is required and must be 1-3 digits.')
    }

    if (formData.billing_amount !== '' && Number(formData.billing_amount) < 0) {
      nextErrors.push('Billing amount cannot be negative.')
    }

    if (formData.discount_percent !== '' && (Number(formData.discount_percent) < 0 || Number(formData.discount_percent) > 100)) {
      nextErrors.push('Discount percent must be between 0 and 100.')
    }

    const emailFields: Array<keyof FormData> = ['business_emails', 'billing_emails', 'personal_emails']
    emailFields.forEach((field) => {
      const emails = formData[field] as Email[]
      emails.forEach((entry, index) => {
        if (entry.email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) {
          nextErrors.push(`${field.replace('_', ' ')} #${index + 1} must be a valid email address.`)
        }
      })
    })

    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    try {
      const url = isEditing
        ? `/api/customers/${accountNumber}`
        : '/api/customers'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccessMessage('Customer saved successfully.')
        setErrors([])
        setTimeout(() => {
          navigate('/customers')
        }, 1200)
      } else {
        const errorData = await response.json()
        if (errorData?.details) {
          setErrors([errorData.error, ...errorData.details.map((detail: any) => detail.message)])
        }
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/customers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Customer' : 'Add New Customer'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {successMessage && (
          <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}
        {errors.length > 0 && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Please fix the following issues:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Account Number</Label>
                <Input
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <Label>Class Code (4 digits)</Label>
                <Input
                  name="class_code"
                  value={formData.class_code}
                  onChange={handleClassCodeChange}
                  maxLength={4}
                  placeholder="1234"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.class_code && formData.class_description}
                </p>
              </div>
              <div>
                <Label>Billing Code</Label>
                <select
                  name="billing_code"
                  value={formData.billing_code}
                  onChange={handleBillingCodeChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select billing code</option>
                  {Object.entries(BILLING_CODES).map(([code, desc]) => (
                    <option key={code} value={code}>{code} - {desc}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Business Name 1</Label>
                <Input
                  name="business_name_1"
                  value={formData.business_name_1}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Business Name 2</Label>
                <Input
                  name="business_name_2"
                  value={formData.business_name_2}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Address 1</Label>
                <Input
                  name="business_address_1"
                  value={formData.business_address_1}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Address 2</Label>
                <Input
                  name="business_address_2"
                  value={formData.business_address_2}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Phone 1</Label>
                <Input
                  name="business_phone_1"
                  value={formData.business_phone_1}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Phone 1 Description</Label>
                <Input
                  name="business_phone_1_desc"
                  value={formData.business_phone_1_desc}
                  onChange={handleChange}
                  placeholder="Office/Cell/Contact"
                />
              </div>
            </div>

            {/* Business Emails */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Business Emails</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addEmail('business_emails')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Email
                </Button>
              </div>
              {formData.business_emails.map((email, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Email address"
                    value={email.email}
                    onChange={(e) => updateEmail('business_emails', index, 'email', e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={email.description}
                    onChange={(e) => updateEmail('business_emails', index, 'description', e.target.value)}
                    className="w-32"
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeEmail('business_emails', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Last Name 1</Label>
                <Input
                  name="last_name_1"
                  value={formData.last_name_1}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Last Name 2</Label>
                <Input
                  name="last_name_2"
                  value={formData.last_name_2}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>First Name 1</Label>
                <Input
                  name="first_name_1"
                  value={formData.first_name_1}
                  onChange={handleChange}
                  maxLength={25}
                />
              </div>
              <div>
                <Label>First Name 2</Label>
                <Input
                  name="first_name_2"
                  value={formData.first_name_2}
                  onChange={handleChange}
                  maxLength={25}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Billing Name 1</Label>
                <Input
                  name="billing_name_1"
                  value={formData.billing_name_1}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Billing Name 2</Label>
                <Input
                  name="billing_name_2"
                  value={formData.billing_name_2}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Billing Address 1</Label>
                <Input
                  name="billing_address_1"
                  value={formData.billing_address_1}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Billing Address 2</Label>
                <Input
                  name="billing_address_2"
                  value={formData.billing_address_2}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Billing Address 3</Label>
                <Input
                  name="billing_address_3"
                  value={formData.billing_address_3}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Billing Phone 1</Label>
                <Input
                  name="billing_phone_1"
                  value={formData.billing_phone_1}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Billing Phone 1 Description</Label>
                <Input
                  name="billing_phone_1_desc"
                  value={formData.billing_phone_1_desc}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Billing Phone 2</Label>
                <Input
                  name="billing_phone_2"
                  value={formData.billing_phone_2}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Billing Phone 2 Description</Label>
                <Input
                  name="billing_phone_2_desc"
                  value={formData.billing_phone_2_desc}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Billing Phone 3</Label>
                <Input
                  name="billing_phone_3"
                  value={formData.billing_phone_3}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Billing Phone 3 Description</Label>
                <Input
                  name="billing_phone_3_desc"
                  value={formData.billing_phone_3_desc}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Billing Amount</Label>
                <Input
                  name="billing_amount"
                  type="number"
                  step="0.01"
                  value={formData.billing_amount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Service Call Rate</Label>
                <Input
                  name="service_call_rate"
                  type="number"
                  step="0.01"
                  value={formData.service_call_rate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Hourly Labor Rate</Label>
                <Input
                  name="hourly_labor_rate"
                  type="number"
                  step="0.01"
                  value={formData.hourly_labor_rate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Discount %</Label>
                <Input
                  name="discount_percent"
                  type="number"
                  step="0.01"
                  value={formData.discount_percent}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Discount Reason</Label>
                <Input
                  name="discount_reason"
                  value={formData.discount_reason}
                  onChange={handleChange}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Billing Emails</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addEmail('billing_emails')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Email
                </Button>
              </div>
              {formData.billing_emails.map((email, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Email address"
                    value={email.email}
                    onChange={(e) => updateEmail('billing_emails', index, 'email', e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={email.description}
                    onChange={(e) => updateEmail('billing_emails', index, 'description', e.target.value)}
                    className="w-32"
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeEmail('billing_emails', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact & Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contact 1 Name</Label>
                <Input
                  name="contact_1_name"
                  value={formData.contact_1_name}
                  onChange={handleChange}
                  maxLength={50}
                />
              </div>
              <div>
                <Label>Contact 2 Name</Label>
                <Input
                  name="contact_2_name"
                  value={formData.contact_2_name}
                  onChange={handleChange}
                  maxLength={50}
                />
              </div>
              <div>
                <Label>Home Phone 1</Label>
                <Input
                  name="home_phone_1"
                  value={formData.home_phone_1}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Home Phone 2</Label>
                <Input
                  name="home_phone_2"
                  value={formData.home_phone_2}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Cell Phone 1</Label>
                <Input
                  name="cell_phone_1"
                  value={formData.cell_phone_1}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Cell Phone 1 Description</Label>
                <Input
                  name="cell_phone_1_desc"
                  value={formData.cell_phone_1_desc}
                  onChange={handleChange}
                  maxLength={25}
                />
              </div>
              <div>
                <Label>Cell Phone 2</Label>
                <Input
                  name="cell_phone_2"
                  value={formData.cell_phone_2}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Cell Phone 2 Description</Label>
                <Input
                  name="cell_phone_2_desc"
                  value={formData.cell_phone_2_desc}
                  onChange={handleChange}
                  maxLength={25}
                />
              </div>
              <div>
                <Label>Cell Phone 3</Label>
                <Input
                  name="cell_phone_3"
                  value={formData.cell_phone_3}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Cell Phone 3 Description</Label>
                <Input
                  name="cell_phone_3_desc"
                  value={formData.cell_phone_3_desc}
                  onChange={handleChange}
                  maxLength={25}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Personal Emails</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addEmail('personal_emails')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Email
                </Button>
              </div>
              {formData.personal_emails.map((email, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Email address"
                    value={email.email}
                    onChange={(e) => updateEmail('personal_emails', index, 'email', e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={email.description}
                    onChange={(e) => updateEmail('personal_emails', index, 'description', e.target.value)}
                    className="w-32"
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeEmail('personal_emails', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Installation Date</Label>
                <Input
                  name="installation_date"
                  type="date"
                  value={formData.installation_date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Installing Company</Label>
                <Input
                  name="installing_company"
                  value={formData.installing_company}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Panel Model/Make</Label>
                <Input
                  name="panel_model"
                  value={formData.panel_model}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Panel Location</Label>
                <Input
                  name="panel_location"
                  value={formData.panel_location}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Central Station</Label>
                <Input
                  name="central_station"
                  value={formData.central_station}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Central Station Account</Label>
                <Input
                  name="central_station_account"
                  value={formData.central_station_account}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="last_nfpa_form_on_file"
                  checked={formData.last_nfpa_form_on_file}
                  onChange={handleChange}
                />
                <span className="text-sm">Last NFPA Form on File</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="monitoring_agreement_on_file"
                  checked={formData.monitoring_agreement_on_file}
                  onChange={handleChange}
                />
                <span className="text-sm">Monitoring Agreement on File</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Save Customer
          </Button>
          <Link to="/customers">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
