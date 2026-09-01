import type { CommercialCompanySummary } from '../../domain/commercial'
import { formatNumber, formatPercent } from '../../utils/format'

type CommercialGroupViewProps = {
  companies: CommercialCompanySummary[]
}

export function CommercialGroupView({ companies }: CommercialGroupViewProps) {
  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Os funis possuem jornadas diferentes. A visão de grupo compara indicadores
        normalizados; selecione uma empresa para analisar as etapas específicas.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        {companies.map((company) => (
          <article
            key={company.companyId}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Oportunidades</dt>
                <dd className="font-medium text-slate-900">
                  {formatNumber(company.opportunityCount)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Conversão final</dt>
                <dd className="font-medium text-slate-900">
                  {formatPercent(company.finalConversionRate)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Ciclo médio</dt>
                <dd className="font-medium text-slate-900">
                  {company.averageCycleDays !== null
                    ? `${formatNumber(company.averageCycleDays)} dias`
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Oportunidades abertas</dt>
                <dd className="font-medium text-slate-900">
                  {formatNumber(company.openOpportunityCount)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Oportunidades</th>
              <th className="px-4 py-3 font-medium">Conversão final</th>
              <th className="px-4 py-3 font-medium">Ciclo médio</th>
              <th className="px-4 py-3 font-medium">Abertas</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.companyId} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {company.name}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatNumber(company.opportunityCount)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatPercent(company.finalConversionRate)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {company.averageCycleDays !== null
                    ? `${formatNumber(company.averageCycleDays)} dias`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatNumber(company.openOpportunityCount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
