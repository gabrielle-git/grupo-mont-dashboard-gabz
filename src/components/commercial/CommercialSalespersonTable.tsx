import type { CompanyId } from '../../data/types'
import type { SalespersonPerformance } from '../../domain/commercial'
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format'

type CommercialSalespersonTableProps = {
  companyId: CompanyId
  salespeople: SalespersonPerformance[]
}

const FINAL_STAGE_LABEL: Record<CompanyId, string> = {
  montseguro: 'Contratadas',
  prop5: 'Fechadas',
  techbrabo: 'Contratadas',
}

const CONVERSION_LABEL: Record<CompanyId, string> = {
  montseguro: 'Conversão até Contratação',
  prop5: 'Conversão',
  techbrabo: 'Conversão',
}

export function CommercialSalespersonTable({
  companyId,
  salespeople,
}: CommercialSalespersonTableProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">Performance comercial</h3>
      <p className="mt-1 text-sm text-slate-500">
        Comparativo por vendedor com base nas oportunidades do período.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Vendedor</th>
              <th className="px-4 py-3 font-medium">Oportunidades</th>
              <th className="px-4 py-3 font-medium">
                {FINAL_STAGE_LABEL[companyId]}
              </th>
              <th className="px-4 py-3 font-medium">
                {CONVERSION_LABEL[companyId]}
              </th>
              <th className="px-4 py-3 font-medium">Pipeline ponderado</th>
            </tr>
          </thead>
          <tbody>
            {salespeople.map((salesperson) => (
              <tr
                key={salesperson.salespersonId}
                className="border-b border-slate-100"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {salesperson.name}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatNumber(salesperson.opportunityCount)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatNumber(salesperson.finalStageCount)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatPercent(salesperson.finalConversionRate)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatCurrency(salesperson.openWeightedPipeline)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
