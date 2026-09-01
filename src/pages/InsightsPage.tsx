import { useState } from 'react'
import { InsightsDashboard } from '../components/insights/InsightsDashboard'
import { generateInsights } from '../domain/insights'

const COMPANY_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'montseguro', label: 'Montseguro' },
  { id: 'prop5', label: 'Prop5' },
  { id: 'techbrabo', label: 'TechBrabo' },
]

export function InsightsPage() {
  const [companyFilter, setCompanyFilter] = useState('all')
  const summary = generateInsights()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Insights</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Descubra padrões e oportunidades emergentes nos dados do grupo para
          agir com antecedência.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {COMPANY_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setCompanyFilter(filter.id)}
            className={[
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              companyFilter === filter.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            ].join(' ')}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <InsightsDashboard summary={summary} companyFilter={companyFilter} />
    </div>
  )
}
