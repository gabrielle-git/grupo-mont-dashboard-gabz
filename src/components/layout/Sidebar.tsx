import { NavLink } from 'react-router-dom'
import { navItems } from './navConfig'

export function Sidebar() {
  return (
    <aside className="bg-slate-900 text-white lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
      <div className="border-b border-slate-700 px-6 py-6">
        <p className="text-lg font-semibold tracking-wide">GRUPO MONT</p>
        <p className="mt-1 text-sm text-slate-400">Executive Dashboard</p>
      </div>

      <nav className="flex flex-wrap gap-1 p-4 lg:flex-1 lg:flex-col lg:gap-0.5 lg:p-3">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
