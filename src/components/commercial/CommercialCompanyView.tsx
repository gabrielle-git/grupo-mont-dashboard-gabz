import type { CommercialCompanySummary } from '../../domain/commercial'
import { CommercialBottleneck } from './CommercialBottleneck'
import { CommercialFunnelChart } from './CommercialFunnelChart'
import { CommercialMetricCards } from './CommercialMetricCards'
import { CommercialSalespersonTable } from './CommercialSalespersonTable'
import { formatCurrency } from '../../utils/format'

type CommercialCompanyViewProps = {
  company: CommercialCompanySummary
}

export function CommercialCompanyView({ company }: CommercialCompanyViewProps) {
  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {company.businessContext}
      </p>

      <CommercialMetricCards company={company} />

      {company.companyId === 'prop5' && (
        <p className="text-sm text-slate-500">
          Pipeline nominal aberto: {formatCurrency(company.pipeline.nominalValue)}{' '}
          · ponderado: {formatCurrency(company.pipeline.weightedValue)} (potencial
          comercial, não receita).
        </p>
      )}

      <CommercialFunnelChart
        companyId={company.companyId}
        funnel={company.funnel}
      />
      <CommercialBottleneck
        key={company.companyId}
        bottleneck={company.bottleneck}
      />
      <CommercialSalespersonTable
        companyId={company.companyId}
        salespeople={company.salespersonPerformance}
      />
    </div>
  )
}
