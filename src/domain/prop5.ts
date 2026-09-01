import type { InvestmentDeal, Opportunity, Target } from '../data/types'
import {
  buildExecutiveMetrics,
  type ExecutiveMetrics,
  filterByCompany,
  isInPeriod,
  percentage,
  sum,
} from './common'

const COMPANY_ID = 'prop5'
const CLOSED_STAGE = 'closed'

export type Prop5Kpis = {
  activePipelineNominal: number
  weightedPipeline: number
  projectedCommission: number
  realizedCommissionInPeriod: number
  achievementPercentage: number
  opportunityCount: number
  closingRate: number
  top3WeightedPipelineConcentration: number
}

function getProp5Opportunities(opportunities: Opportunity[]): Opportunity[] {
  return filterByCompany(opportunities, COMPANY_ID)
}

function getActiveOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.filter((opp) => opp.stage !== CLOSED_STAGE)
}

function getCommissionTarget(targets: Target[], period: string): number {
  return (
    targets.find(
      (target) =>
        target.companyId === COMPANY_ID &&
        target.period === period &&
        target.metric === 'commission_realized',
    )?.targetValue ?? 0
  )
}

function getActiveDealOpportunityIds(deals: InvestmentDeal[]): Set<string> {
  return new Set(
    deals
      .filter((deal) => deal.closedAt === null)
      .map((deal) => deal.opportunityId),
  )
}

function getRealizedCommissionInPeriod(
  investmentDeals: InvestmentDeal[],
  period: string,
): number {
  return sum(
    investmentDeals
      .filter((deal) => isInPeriod(deal.closedAt, period))
      .map((deal) => deal.realizedCommission),
  )
}

// Prop5 tem ciclo consultivo e fechamentos irregulares: o forecast combina
// comissão já realizada com comissão projetada das oportunidades abertas,
// ponderada por probabilidade, apenas quando o fechamento previsto cai no período.
function calculateProp5ForecastCommission(
  opportunities: Opportunity[],
  investmentDeals: InvestmentDeal[],
  period: string,
): number {
  const realizedCommission = getRealizedCommissionInPeriod(
    investmentDeals,
    period,
  )
  const dealByOpportunityId = new Map(
    investmentDeals.map((deal) => [deal.opportunityId, deal]),
  )

  const weightedOpenCommission = sum(
    getActiveOpportunities(getProp5Opportunities(opportunities))
      .filter((opp) => isInPeriod(opp.expectedCloseDate, period))
      .map((opp) => {
        const deal = dealByOpportunityId.get(opp.id)
        if (!deal) return 0
        return deal.projectedCommission * opp.probability
      }),
  )

  return realizedCommission + weightedOpenCommission
}

export function calculateProp5Kpis(
  opportunities: Opportunity[],
  investmentDeals: InvestmentDeal[],
  targets: Target[],
  period: string,
): Prop5Kpis {
  const prop5Opportunities = getProp5Opportunities(opportunities)
  const activeOpportunities = getActiveOpportunities(prop5Opportunities)
  const activeDealIds = getActiveDealOpportunityIds(investmentDeals)

  const weightedValues = activeOpportunities.map(
    (opp) => opp.value * opp.probability,
  )

  const sortedWeightedValues = [...weightedValues].sort((a, b) => b - a)
  const totalWeightedPipeline = sum(weightedValues)
  const top3Weighted = sum(sortedWeightedValues.slice(0, 3))

  const closedInPeriod = prop5Opportunities.filter(
    (opp) => opp.stage === CLOSED_STAGE,
  ).length

  const realizedCommissionInPeriod = getRealizedCommissionInPeriod(
    investmentDeals,
    period,
  )

  const commissionTarget = getCommissionTarget(targets, period)

  return {
    activePipelineNominal: sum(activeOpportunities.map((opp) => opp.value)),
    weightedPipeline: totalWeightedPipeline,
    projectedCommission: sum(
      investmentDeals
        .filter((deal) => activeDealIds.has(deal.opportunityId))
        .map((deal) => deal.projectedCommission),
    ),
    realizedCommissionInPeriod,
    achievementPercentage: percentage(
      realizedCommissionInPeriod,
      commissionTarget,
    ),
    opportunityCount: prop5Opportunities.length,
    closingRate: percentage(closedInPeriod, prop5Opportunities.length),
    top3WeightedPipelineConcentration: percentage(
      top3Weighted,
      totalWeightedPipeline,
    ),
  }
}

export function calculateProp5ExecutiveMetrics(
  opportunities: Opportunity[],
  investmentDeals: InvestmentDeal[],
  targets: Target[],
  period: string,
  asOfDate: string,
): ExecutiveMetrics {
  const kpis = calculateProp5Kpis(
    opportunities,
    investmentDeals,
    targets,
    period,
  )
  const forecast = calculateProp5ForecastCommission(
    opportunities,
    investmentDeals,
    period,
  )

  return buildExecutiveMetrics(
    kpis.realizedCommissionInPeriod,
    getCommissionTarget(targets, period),
    forecast,
    period,
    asOfDate,
  )
}
