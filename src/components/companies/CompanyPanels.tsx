import type {
  MontseguroCompanyView,
  Prop5CompanyView,
  TechbraboCompanyView,
} from '../../domain/companies'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '../../utils/format'

function BusinessReading({ text }: { text: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-sm font-semibold text-slate-900">Leitura do negócio</h3>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </section>
  )
}

function MetricGrid({
  items,
}: {
  items: { label: string; value: string }[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export function MontseguroCompanyPanel({ data }: { data: MontseguroCompanyView }) {
  return (
    <div className="space-y-6">
      <MetricGrid
        items={[
          { label: 'Vidas implantadas', value: formatNumber(data.implantedLives) },
          { label: 'Vidas contratadas', value: formatNumber(data.contractedLives) },
          { label: 'Meta', value: formatNumber(data.target) },
          { label: 'Forecast', value: formatNumber(data.forecast) },
          { label: 'Contratos', value: formatNumber(data.contractCount) },
          {
            label: 'Média vidas/contrato',
            value: formatNumber(Math.round(data.averageLivesPerContract)),
          },
          {
            label: 'Taxa Contratação → Implantação',
            value: formatPercent(data.contractedToImplementedRate),
          },
          {
            label: 'Principal gargalo',
            value: data.bottleneck ?? '—',
          },
        ]}
      />
      <BusinessReading text={data.businessReading} />
    </div>
  )
}

export function Prop5CompanyPanel({ data }: { data: Prop5CompanyView }) {
  return (
    <div className="space-y-6">
      <MetricGrid
        items={[
          {
            label: 'Comissão realizada',
            value: formatCurrency(data.realizedCommission),
          },
          { label: 'Meta', value: formatCurrency(data.target) },
          { label: 'Forecast', value: formatCurrency(data.forecast) },
          {
            label: 'Pipeline nominal',
            value: formatCurrency(data.nominalPipeline),
          },
          {
            label: 'Pipeline ponderado',
            value: formatCurrency(data.weightedPipeline),
          },
          {
            label: 'Comissão projetada',
            value: formatCurrency(data.projectedCommission),
          },
          { label: 'Taxa de fechamento', value: formatPercent(data.closingRate) },
          {
            label: 'Ciclo médio',
            value:
              data.averageCycleDays !== null
                ? `${formatNumber(data.averageCycleDays)} dias`
                : '—',
          },
          {
            label: 'Concentração top 3',
            value: formatPercent(data.top3Concentration),
          },
        ]}
      />
      <BusinessReading text={data.businessReading} />
    </div>
  )
}

export function TechbraboCompanyPanel({ data }: { data: TechbraboCompanyView }) {
  return (
    <div className="space-y-6">
      <MetricGrid
        items={[
          {
            label: 'Receita reconhecida',
            value: formatCurrency(data.recognizedRevenue),
          },
          { label: 'Meta', value: formatCurrency(data.target) },
          { label: 'Forecast', value: formatCurrency(data.forecast) },
          { label: 'MRR', value: formatCurrency(data.mrr) },
          { label: 'Receita pontual', value: formatCurrency(data.pointRevenue) },
          { label: 'Projetos ativos', value: formatNumber(data.activeProjects) },
          {
            label: 'Projetos alto risco',
            value: formatNumber(data.highRiskProjects),
          },
          {
            label: 'Pipeline ponderado',
            value: formatCurrency(data.weightedPipeline),
          },
        ]}
      />
      <BusinessReading text={data.businessReading} />
    </div>
  )
}
