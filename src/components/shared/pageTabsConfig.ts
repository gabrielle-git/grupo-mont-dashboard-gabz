import type { CompanyId } from '../../data/types'

export const COMPANY_TABS: { id: CompanyId; label: string }[] = [
  { id: 'montseguro', label: 'Montseguro' },
  { id: 'prop5', label: 'Prop5' },
  { id: 'techbrabo', label: 'TechBrabo' },
]

export const MARKETING_TABS: { id: 'group' | CompanyId; label: string }[] = [
  { id: 'group', label: 'Grupo' },
  ...COMPANY_TABS,
]
