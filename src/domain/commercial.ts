import companies from '../data/companies.json'
import opportunitiesData from '../data/opportunities.json'
import salespeopleData from '../data/salespeople.json'
import type { CompanyId, Opportunity, Salesperson } from '../data/types'
import { average, filterByCompany, percentage, sum } from './common'

const opportunities = opportunitiesData as Opportunity[]
const salespeople = salespeopleData as Salesperson[]

export type FunnelStageKey = string

export type FunnelStageDefinition = {
  key: FunnelStageKey
  label: string
}

export type FunnelStageMetrics = {
  key: FunnelStageKey
  label: string
  count: number
  conversionFromPrevious: number | null
  dropFromPrevious: number | null
}

export type FunnelBottleneck = {
  fromStage: string
  toStage: string
  fromLabel: string
  toLabel: string
  dropPercentage: number
} | null

export type CommercialPipeline = {
  openOpportunityCount: number
  nominalValue: number
  weightedValue: number
}

export type SalespersonPerformance = {
  salespersonId: string
  name: string
  opportunityCount: number
  finalStageCount: number
  finalConversionRate: number
  openNominalPipeline: number
  openWeightedPipeline: number
}

export type CommercialCompanySummary = {
  companyId: CompanyId
  name: string
  opportunityCount: number
  finalConversionRate: number
  averageCycleDays: number | null
  openOpportunityCount: number
  pipeline: CommercialPipeline
  funnel: FunnelStageMetrics[]
  overallConversionRate: number
  bottleneck: FunnelBottleneck
  salespersonPerformance: SalespersonPerformance[]
  businessContext: string
}

export type CommercialGroupSummary = {
  companies: CommercialCompanySummary[]
}

const FUNNEL_DEFINITIONS: Record<CompanyId, FunnelStageDefinition[]> = {
  montseguro: [
    { key: 'lead', label: 'Lead' },
    { key: 'qualified', label: 'Qualificado' },
    { key: 'quote', label: 'Cotação' },
    { key: 'proposal', label: 'Proposta' },
    { key: 'contracted', label: 'Contratação' },
    { key: 'implemented', label: 'Implantação' },
  ],
  prop5: [
    { key: 'lead', label: 'Lead' },
    { key: 'qualified', label: 'Qualificado' },
    { key: 'diagnosis', label: 'Diagnóstico' },
    { key: 'meeting', label: 'Reunião' },
    { key: 'opportunity', label: 'Oportunidade' },
    { key: 'negotiation', label: 'Negociação' },
    { key: 'structuring', label: 'Estruturação' },
    { key: 'closed', label: 'Fechamento' },
  ],
  techbrabo: [
    { key: 'lead', label: 'Lead' },
    { key: 'qualified', label: 'Qualificado' },
    { key: 'meeting', label: 'Reunião' },
    { key: 'diagnosis', label: 'Diagnóstico' },
    { key: 'proposal', label: 'Proposta' },
    { key: 'negotiation', label: 'Negociação' },
    { key: 'contracted', label: 'Contrato' },
  ],
}

const FINAL_STAGE: Record<CompanyId, FunnelStageKey> = {
  montseguro: 'implemented',
  prop5: 'closed',
  techbrabo: 'contracted',
}

const SALESPERSON_FINAL_STAGE: Record<CompanyId, FunnelStageKey> = {
  montseguro: 'contracted',
  prop5: 'closed',
  techbrabo: 'contracted',
}

const BUSINESS_CONTEXT: Record<CompanyId, string> = {
  montseguro:
    'Contratação não significa implantação concluída; a análise comercial acompanha as duas etapas.',
  prop5:
    'Pipeline representa potencial comercial. Valor da oportunidade não deve ser tratado como receita realizada.',
  techbrabo:
    'Novos contratos precisam ser analisados em conjunto com a capacidade operacional da empresa.',
}

function hasReachedStage(opportunity: Opportunity, stage: FunnelStageKey): boolean {
  return opportunity.stageHistory.some((item) => item.stage === stage)
}

function isOpenOpportunity(
  opportunity: Opportunity,
  companyId: CompanyId,
): boolean {
  return opportunity.stage !== FINAL_STAGE[companyId]
}

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const millisecondsPerDay = 1000 * 60 * 60 * 24
  return Math.round((end.getTime() - start.getTime()) / millisecondsPerDay)
}

function calculateFunnel(
  companyOpportunities: Opportunity[],
  companyId: CompanyId,
): FunnelStageMetrics[] {
  const stages = FUNNEL_DEFINITIONS[companyId]

  const counts = stages.map(
    (stage) =>
      companyOpportunities.filter((opportunity) =>
        hasReachedStage(opportunity, stage.key),
      ).length,
  )

  return stages.map((stage, index) => {
    const previousCount = index > 0 ? counts[index - 1] : null
    const conversionFromPrevious =
      previousCount === null
        ? null
        : percentage(counts[index], previousCount)
    const dropFromPrevious =
      previousCount === null || previousCount === 0
        ? null
        : percentage(previousCount - counts[index], previousCount)

    return {
      key: stage.key,
      label: stage.label,
      count: counts[index],
      conversionFromPrevious,
      dropFromPrevious,
    }
  })
}

function findBottleneck(funnel: FunnelStageMetrics[]): FunnelBottleneck {
  let bottleneck: FunnelBottleneck = null

  for (let index = 1; index < funnel.length; index += 1) {
    const previous = funnel[index - 1]
    const current = funnel[index]
    const dropPercentage = current.dropFromPrevious ?? 0

    if (!bottleneck || dropPercentage > bottleneck.dropPercentage) {
      bottleneck = {
        fromStage: previous.key,
        toStage: current.key,
        fromLabel: previous.label,
        toLabel: current.label,
        dropPercentage,
      }
    }
  }

  return bottleneck
}

function calculateAverageCycleDays(
  companyOpportunities: Opportunity[],
  companyId: CompanyId,
): number | null {
  const finalStage = FINAL_STAGE[companyId]
  const completedCycles = companyOpportunities
    .filter((opportunity) => hasReachedStage(opportunity, finalStage))
    .map((opportunity) => {
      if (opportunity.stageHistory.length < 2) return null

      const firstDate = opportunity.stageHistory[0]?.date
      const lastDate =
        opportunity.stageHistory[opportunity.stageHistory.length - 1]?.date

      if (!firstDate || !lastDate) return null

      return daysBetween(firstDate, lastDate)
    })
    .filter((value): value is number => value !== null)

  if (completedCycles.length === 0) return null

  return Math.round(average(completedCycles))
}

function calculatePipeline(
  companyOpportunities: Opportunity[],
  companyId: CompanyId,
): CommercialPipeline {
  const openOpportunities = companyOpportunities.filter((opportunity) =>
    isOpenOpportunity(opportunity, companyId),
  )

  return {
    openOpportunityCount: openOpportunities.length,
    nominalValue: sum(openOpportunities.map((opportunity) => opportunity.value)),
    weightedValue: sum(
      openOpportunities.map(
        (opportunity) => opportunity.value * opportunity.probability,
      ),
    ),
  }
}

function calculateSalespersonPerformance(
  companyOpportunities: Opportunity[],
  companySalespeople: Salesperson[],
  companyId: CompanyId,
): SalespersonPerformance[] {
  const finalStage = SALESPERSON_FINAL_STAGE[companyId]

  return companySalespeople.map((salesperson) => {
    const salespersonOpportunities = companyOpportunities.filter(
      (opportunity) => opportunity.salespersonId === salesperson.id,
    )
    const openOpportunities = salespersonOpportunities.filter((opportunity) =>
      isOpenOpportunity(opportunity, companyId),
    )
    const finalStageCount = salespersonOpportunities.filter((opportunity) =>
      hasReachedStage(opportunity, finalStage),
    ).length

    return {
      salespersonId: salesperson.id,
      name: salesperson.name,
      opportunityCount: salespersonOpportunities.length,
      finalStageCount,
      finalConversionRate: percentage(
        finalStageCount,
        salespersonOpportunities.length,
      ),
      openNominalPipeline: sum(
        openOpportunities.map((opportunity) => opportunity.value),
      ),
      openWeightedPipeline: sum(
        openOpportunities.map(
          (opportunity) => opportunity.value * opportunity.probability,
        ),
      ),
    }
  })
}

function getCompanyName(companyId: CompanyId): string {
  return (
    companies.find((company) => company.id === companyId)?.name ?? companyId
  )
}

function buildCommercialCompanySummary(
  companyId: CompanyId,
): CommercialCompanySummary {
  const companyOpportunities = filterByCompany(opportunities, companyId)
  const companySalespeople = filterByCompany(salespeople, companyId)
  const funnel = calculateFunnel(companyOpportunities, companyId)
  const firstStageCount = funnel[0]?.count ?? 0
  const finalStageCount = funnel[funnel.length - 1]?.count ?? 0
  const pipeline = calculatePipeline(companyOpportunities, companyId)

  return {
    companyId,
    name: getCompanyName(companyId),
    opportunityCount: companyOpportunities.length,
    finalConversionRate: percentage(finalStageCount, firstStageCount),
    averageCycleDays: calculateAverageCycleDays(companyOpportunities, companyId),
    openOpportunityCount: pipeline.openOpportunityCount,
    pipeline,
    funnel,
    overallConversionRate: percentage(finalStageCount, firstStageCount),
    bottleneck: findBottleneck(funnel),
    salespersonPerformance: calculateSalespersonPerformance(
      companyOpportunities,
      companySalespeople,
      companyId,
    ),
    businessContext: BUSINESS_CONTEXT[companyId],
  }
}

export function buildCommercialGroupSummary(): CommercialGroupSummary {
  const companyIds: CompanyId[] = ['montseguro', 'prop5', 'techbrabo']

  return {
    companies: companyIds.map((companyId) =>
      buildCommercialCompanySummary(companyId),
    ),
  }
}

export function buildCommercialCompanyData(
  companyId: CompanyId,
): CommercialCompanySummary {
  return buildCommercialCompanySummary(companyId)
}

export function getFunnelDefinitions(companyId: CompanyId): FunnelStageDefinition[] {
  return FUNNEL_DEFINITIONS[companyId]
}
