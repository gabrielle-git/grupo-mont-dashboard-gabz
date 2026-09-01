import type { ChannelMetrics, MarketingCompanySummary } from '../../domain/marketing'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '../../utils/format'
import { MarketingChannelChart } from './MarketingChannelChart'

function ChannelTable({ channels }: { channels: ChannelMetrics[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Canal</th>
            <th className="px-4 py-3 font-medium">Investimento</th>
            <th className="px-4 py-3 font-medium">Leads</th>
            <th className="px-4 py-3 font-medium">Oportunidades</th>
            <th className="px-4 py-3 font-medium">CPL</th>
            <th className="px-4 py-3 font-medium">Custo/Opp.</th>
            <th className="px-4 py-3 font-medium">Conv. L→O</th>
            <th className="px-4 py-3 font-medium">Negócios finais</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel) => (
            <tr key={channel.channel} className="border-b border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-900">
                {channel.channel}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatCurrency(channel.investment)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatNumber(channel.leads)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatNumber(channel.opportunities)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatCurrency(channel.cpl)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {channel.costPerOpportunity !== null
                  ? formatCurrency(channel.costPerOpportunity)
                  : '—'}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatPercent(channel.leadToOpportunityRate)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatNumber(channel.finalDeals)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MetricCards({ data }: { data: MarketingCompanySummary }) {
  const cards = [
    { label: 'Investimento', value: formatCurrency(data.totalInvestment) },
    { label: 'Leads', value: formatNumber(data.totalLeads) },
    { label: 'Oportunidades', value: formatNumber(data.totalOpportunities) },
    { label: 'CPL médio', value: formatCurrency(data.averageCpl) },
    {
      label: 'Custo/Oportunidade',
      value:
        data.averageCostPerOpportunity !== null
          ? formatCurrency(data.averageCostPerOpportunity)
          : '—',
    },
    {
      label: 'Conv. Lead → Opp.',
      value: formatPercent(data.averageLeadToOpportunityRate),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

export function MarketingCompanyView({
  data,
}: {
  data: MarketingCompanySummary
}) {
  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {data.businessNote}
      </p>

      <MetricCards data={data} />

      {(data.bestChannel || data.worstEfficiencyChannel) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.bestChannel && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-900">
                Melhor canal
              </p>
              <p className="mt-1 text-sm text-emerald-800">{data.bestChannel}</p>
            </div>
          )}
          {data.worstEfficiencyChannel && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                Pior eficiência
              </p>
              <p className="mt-1 text-sm text-amber-800">
                {data.worstEfficiencyChannel}
              </p>
            </div>
          )}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Investimento x qualidade por canal
        </h3>
        <div className="mt-4">
          <MarketingChannelChart channels={data.channels} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">
          Ranking por canal
        </h3>
        <ChannelTable channels={data.channels} />
      </section>
    </div>
  )
}

export function MarketingGroupView({
  companies,
}: {
  companies: MarketingCompanySummary[]
}) {
  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Comparativo normalizado por empresa. Métricas de naturezas diferentes não
        são somadas — use CPL, custo por oportunidade e conversão para comparar
        eficiência de aquisição.
      </p>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Investimento</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">CPL</th>
              <th className="px-4 py-3 font-medium">Custo/Opp.</th>
              <th className="px-4 py-3 font-medium">Conv. L→O</th>
              <th className="px-4 py-3 font-medium">Negócios finais</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.companyId} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {company.name}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatCurrency(company.totalInvestment)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatNumber(company.totalLeads)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatCurrency(company.averageCpl)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {company.averageCostPerOpportunity !== null
                    ? formatCurrency(company.averageCostPerOpportunity)
                    : '—'}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatPercent(company.averageLeadToOpportunityRate)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatNumber(company.totalFinalDeals)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
