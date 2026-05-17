import { Outlet, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  Wrench, 
  BarChart3, 
  FileCheck, 
  ClipboardList,
  Calendar
} from 'lucide-react'

export function Layout() {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Payments', href: '/payments', icon: DollarSign },
    { name: 'Service Calls', href: '/service-calls', icon: Wrench },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Statements', href: '/statements', icon: FileCheck },
    { name: 'Forms', href: '/forms', icon: ClipboardList },
    { name: 'Scheduling', href: '/scheduling', icon: Calendar },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold">FBS Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Fire/Burglar Security</p>
        </div>
        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-slate-800 border-l-4 border-blue-500'
                    : 'hover:bg-slate-800 border-l-4 border-transparent'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
