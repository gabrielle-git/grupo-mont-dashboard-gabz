import type { CompanyId } from '../../data/types'
import type { CompanyOverview } from '../../domain/overview'
import {
  formatCurrency,
  formatGapLabel,
  formatNumber,
  formatPercent,
} from '../../utils/format'

type ExecutiveCompanyCardProps = {
  company: CompanyOverview
}

const STATUS_STYLES = {
  green: {
    label: 'Verde',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    bar: 'bg-emerald-600',
  },
  yellow: {
    label: 'Amarelo',
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    bar: 'bg-amber-500',
  },
  red: {
    label: 'Vermelho',
    badge: 'border-red-200 bg-red-50 text-red-800',
    bar: 'bg-red-600',
  },
} as const

function formatValue(companyId: CompanyId, value: number): string {
  return companyId === 'montseguro' ? formatNumber(value) : formatCurrency(value)
}

function getValueUnit(companyId: CompanyId): 'currency' | 'lives' {
  return companyId === 'montseguro' ? 'lives' : 'currency'
}

export function ExecutiveCompanyCard({ company }: ExecutiveCompanyCardProps) {
  const status = STATUS_STYLES[company.executiveStatus]
  const progressWidth = Math.min(company.achievementPercentage, 100)
  const valueUnit = getValueUnit(company.companyId)

  return (
    <article className="flex flex-col rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{company.primaryMetric}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${status.badge}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-2xl font-semibold text-slate-900">
          {formatValue(company.companyId, company.realized)}
          <span className="text-base font-normal text-slate-400">
            {' '}
            / {formatValue(company.companyId, company.target)}
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Atingimento atual: {formatPercent(company.achievementPercentage)}
        </p>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${status.bar}`}
            style={{ width: `${progressWidth}%` }}
            role="progressbar"
            aria-valuenow={progressWidth}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Atingimento de ${company.name}`}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Forecast vs meta: {formatPercent(company.forecastVsTargetPercentage)}
        </p>
      </div>

      <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Meta esperada até hoje</dt>
          <dd className="font-medium text-slate-900">
            {formatValue(company.companyId, company.expectedTargetToDate)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Gap de ritmo</dt>
          <dd className="text-right font-medium text-slate-900">
            {formatGapLabel(company.gapToExpected, valueUnit)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Forecast</dt>
          <dd className="font-medium text-slate-900">
            {formatValue(company.companyId, company.forecast)}
          </dd>
        </div>
      </dl>
    </article>
  )
}
