import type { Insight, InsightsSummary } from '../../domain/insights'

const SEVERITY_STYLES = {
  critical: {
    label: 'Crítico',
    badge: 'border-red-200 bg-red-50 text-red-800',
    border: 'border-red-100',
  },
  warning: {
    label: 'Atenção',
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    border: 'border-amber-100',
  },
  positive: {
    label: 'Positivo',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    border: 'border-emerald-100',
  },
} as const

function InsightCard({ insight }: { insight: Insight }) {
  const style = SEVERITY_STYLES[insight.severity]

  return (
    <article
      className={`rounded-lg border bg-white p-5 ${style.border}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {insight.companyName} · {insight.category}
          </p>
          <h4 className="mt-1 text-base font-semibold text-slate-900">
            {insight.title}
          </h4>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${style.badge}`}
        >
          {style.label}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{insight.message}</p>
      <p className="mt-2 text-xs text-slate-500">
        Métrica: {insight.relatedMetric}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700">
        Recomendação: {insight.recommendation}
      </p>
    </article>
  )
}

function InsightSection({
  title,
  insights,
}: {
  title: string
  insights: Insight[]
}) {
  if (insights.length === 0) return null

  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold text-slate-900">{title}</h3>
      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </section>
  )
}

type InsightsDashboardProps = {
  summary: InsightsSummary
  companyFilter?: string
}

export function InsightsDashboard({
  summary,
  companyFilter = 'all',
}: InsightsDashboardProps) {
  const filterInsights = (insights: Insight[]) =>
    companyFilter === 'all'
      ? insights
      : insights.filter((i) => i.companyId === companyFilter)

  const critical = filterInsights(summary.critical)
  const warning = filterInsights(summary.warning)
  const positive = filterInsights(summary.positive)

  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Insights gerados por regras determinísticas sobre os dados demonstrativos.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-white p-4">
          <p className="text-sm text-slate-500">Críticos</p>
          <p className="mt-1 text-2xl font-semibold text-red-700">
            {critical.length}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-white p-4">
          <p className="text-sm text-slate-500">Atenção</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700">
            {warning.length}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-white p-4">
          <p className="text-sm text-slate-500">Positivos</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">
            {positive.length}
          </p>
        </div>
      </div>

      <InsightSection title="Críticos" insights={critical} />
      <InsightSection title="Atenção" insights={warning} />
      <InsightSection title="Positivos" insights={positive} />
    </div>
  )
}
