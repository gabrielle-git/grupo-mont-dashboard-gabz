import type { CompanyOverview } from '../../domain/overview'
import { EXECUTIVE_STATUS_THRESHOLDS } from '../../domain/common'
import { formatGapLabel, formatPercent } from '../../utils/format'

type PriorityActionsProps = {
  companies: CompanyOverview[]
  prop5Top3Concentration: number
  prop5HasAugustClosuresExpected: boolean
  montseguroContractedToImplemented: number
  techbraboHighRiskCount: number
}

type PriorityItem = {
  companyId: CompanyOverview['companyId']
  title: string
  messages: string[]
}

const PRIORITY_ORDER: CompanyOverview['companyId'][] = [
  'prop5',
  'montseguro',
  'techbrabo',
]

const PRIORITY_LABELS: Record<CompanyOverview['companyId'], string> = {
  prop5: 'Prioridade alta',
  montseguro: 'Atenção',
  techbrabo: 'Meta saudável — atenção operacional',
}

function buildPriorityMessages(
  company: CompanyOverview,
  props: Omit<PriorityActionsProps, 'companies'>,
): string[] {
  if (company.companyId === 'prop5') {
    const messages = [
      `Forecast em ${formatPercent(company.forecastVsTargetPercentage)} da meta — abaixo do patamar de ${formatPercent(EXECUTIVE_STATUS_THRESHOLDS.yellow)}.`,
      `Concentração das 3 maiores oportunidades no pipeline ponderado: ${formatPercent(props.prop5Top3Concentration)}.`,
    ]

    if (!props.prop5HasAugustClosuresExpected) {
      messages.push(
        'Não há novos fechamentos previstos dentro de agosto no pipeline aberto.',
      )
    }

    return messages
  }

  if (company.companyId === 'montseguro') {
    return [
      `Forecast em ${formatPercent(company.forecastVsTargetPercentage)} da meta — abaixo de 100%.`,
      `Gap de ritmo negativo: ${formatGapLabel(company.gapToExpected, 'lives')}.`,
      `Taxa Contracted → Implemented em ${formatPercent(props.montseguroContractedToImplemented)} — possível gargalo na implantação.`,
    ]
  }

  return [
    `Forecast em ${formatPercent(company.forecastVsTargetPercentage)} da meta — leitura positiva para atingimento.`,
    `${props.techbraboHighRiskCount} projetos ativos classificados como alto risco — saúde de meta e saúde operacional são leituras distintas.`,
    `Status executivo ${PRIORITY_LABELS.techbrabo.toLowerCase()}: manter monitoramento operacional mesmo com meta em trajetória favorável.`,
  ]
}

function buildPriorityItems(props: PriorityActionsProps): PriorityItem[] {
  const companyById = new Map(
    props.companies.map((company) => [company.companyId, company]),
  )

  return PRIORITY_ORDER.map((companyId) => {
    const company = companyById.get(companyId)
    if (!company) {
      return {
        companyId,
        title: companyId,
        messages: [],
      }
    }

    return {
      companyId,
      title: `${company.name} — ${PRIORITY_LABELS[companyId]}`,
      messages: buildPriorityMessages(company, props),
    }
  })
}

export function PriorityActions(props: PriorityActionsProps) {
  const items = buildPriorityItems(props)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">Onde agir primeiro</h3>
      <p className="mt-1 text-sm text-slate-500">
        Prioridades sugeridas com base no forecast, ritmo e riscos operacionais.
      </p>

      <ol className="mt-5 space-y-4">
        {items.map((item, index) => (
          <li
            key={item.companyId}
            className="rounded-lg border border-slate-100 bg-slate-50 p-4"
          >
            <p className="text-sm font-semibold text-slate-900">
              {index + 1}. {item.title}
            </p>
            <ul className="mt-2 space-y-1">
              {item.messages.map((message) => (
                <li key={message} className="text-sm text-slate-600">
                  {message}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
