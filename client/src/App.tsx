import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Accounts } from './pages/Accounts'
import { CustomerForm } from './pages/CustomerForm'
import { Customers } from './pages/Customers'
import { Dashboard } from './pages/Dashboard'
import { Estimates } from './pages/Estimates'
import { Forms } from './pages/Forms'
import { Invoices } from './pages/Invoices'
import { Payments } from './pages/Payments'
import { Reports } from './pages/Reports'
import { Scheduling } from './pages/Scheduling'
import { ServiceCalls } from './pages/ServiceCalls'
import { Statements } from './pages/Statements'

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
          <Route path="accounts" element={<Accounts />} />
          <Route path="estimates" element={<Estimates />} />
          <Route path="scheduling" element={<Scheduling />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
