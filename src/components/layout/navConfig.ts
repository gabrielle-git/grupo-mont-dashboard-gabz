import {
  Building2,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  path: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { path: '/', label: 'CEO Overview', icon: LayoutDashboard },
  { path: '/comercial', label: 'Comercial', icon: TrendingUp },
  { path: '/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/empresas', label: 'Empresas', icon: Building2 },
  { path: '/insights', label: 'Insights', icon: Lightbulb },
]
