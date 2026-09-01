import { useState } from 'react'
import type { CompanyId } from '../data/types'
import { CommercialCompanyView } from '../components/commercial/CommercialCompanyView'
import { CommercialGroupView } from '../components/commercial/CommercialGroupView'
import {
  buildCommercialCompanyData,
  buildCommercialGroupSummary,
} from '../domain/commercial'

type CommercialTab = 'group' | CompanyId

const TABS: { id: CommercialTab; label: string }[] = [
  { id: 'group', label: 'Grupo' },
  { id: 'montseguro', label: 'Montseguro' },
  { id: 'prop5', label: 'Prop5' },
  { id: 'techbrabo', label: 'TechBrabo' },
]

export function CommercialPage() {
  const [activeTab, setActiveTab] = useState<CommercialTab>('group')
  const groupSummary = buildCommercialGroupSummary()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Comercial</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Acompanhe o funil e a performance comercial para ajustar metas e
          recursos de vendas.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'group' ? (
        <CommercialGroupView companies={groupSummary.companies} />
      ) : (
        <CommercialCompanyView
          key={activeTab}
          company={buildCommercialCompanyData(activeTab)}
        />
      )}
    </div>
  )
}
