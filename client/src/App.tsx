import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { CustomerForm } from './pages/CustomerForm'
import { Invoices } from './pages/Invoices'
import { Payments } from './pages/Payments'
import { ServiceCalls } from './pages/ServiceCalls'
import { Reports } from './pages/Reports'
import { Statements } from './pages/Statements'
import { Forms } from './pages/Forms'
import { Scheduling } from './pages/Scheduling'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:accountNumber" element={<CustomerForm />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="service-calls" element={<ServiceCalls />} />
          <Route path="reports" element={<Reports />} />
          <Route path="statements" element={<Statements />} />
          <Route path="forms" element={<Forms />} />
          <Route path="scheduling" element={<Scheduling />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
