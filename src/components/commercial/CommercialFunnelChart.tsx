import type { CompanyId } from '../../data/types'
import type { FunnelStageMetrics } from '../../domain/commercial'
import { formatNumber, formatPercent } from '../../utils/format'

type CommercialFunnelChartProps = {
  companyId: CompanyId
  funnel: FunnelStageMetrics[]
}

export function CommercialFunnelChart({
  companyId,
  funnel,
}: CommercialFunnelChartProps) {
  const maxCount = Math.max(...funnel.map((stage) => stage.count), 1)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">Funil comercial</h3>
      <p className="mt-1 text-sm text-slate-500">
        Quantidade de oportunidades que chegaram a cada etapa e conversão entre
        etapas consecutivas.
      </p>

      <div className="mt-6 space-y-4">
        {funnel.map((stage) => {
          const widthPercentage = (stage.count / maxCount) * 100

          return (
            <div key={`${companyId}-${stage.key}`}>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-slate-900">{stage.label}</span>
                <span className="text-slate-600">
                  {formatNumber(stage.count)}
                  {stage.conversionFromPrevious !== null && (
                    <span className="text-slate-400">
                      {' '}
                      · {formatPercent(stage.conversionFromPrevious)} da etapa
                      anterior
                    </span>
                  )}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-700"
                  style={{ width: `${widthPercentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
