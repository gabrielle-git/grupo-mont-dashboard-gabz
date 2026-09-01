import { useLocation } from 'react-router-dom'
import { navItems } from './navConfig'

export function Header() {
  const { pathname } = useLocation()
  const currentPage =
    navItems.find((item) => item.path === pathname)?.label ?? 'Dashboard'

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{currentPage}</h1>
        <p className="text-sm text-slate-500">Dados demonstrativos · Agosto de 2026</p>
      </div>
    </header>
  )
}
