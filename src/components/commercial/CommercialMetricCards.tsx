import type { CommercialCompanySummary } from '../../domain/commercial'
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format'

type CommercialMetricCardsProps = {
  company: CommercialCompanySummary
}

export function CommercialMetricCards({ company }: CommercialMetricCardsProps) {
  const cards = [
    {
      label: 'Oportunidades',
      value: formatNumber(company.opportunityCount),
    },
    {
      label: 'Conversão final',
      value: formatPercent(company.finalConversionRate),
    },
    {
      label: 'Ciclo médio',
      value:
        company.averageCycleDays !== null
          ? `${formatNumber(company.averageCycleDays)} dias`
          : '—',
    },
    {
      label: 'Oportunidades abertas',
      value: formatNumber(company.openOpportunityCount),
    },
    {
      label: 'Pipeline ponderado',
      value: formatCurrency(company.pipeline.weightedValue),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
