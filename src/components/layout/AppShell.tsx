import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:ml-64">
        <Header />
        <main className="flex-1 px-6 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
