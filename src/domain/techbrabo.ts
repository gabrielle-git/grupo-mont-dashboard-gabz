import type {
  Opportunity,
  RevenueMonthly,
  Target,
  TechProject,
} from '../data/types'
import {
  buildExecutiveMetrics,
  calculateLinearPaceForecast,
  type ExecutiveMetrics,
  filterByCompany,
  percentage,
  sum,
} from './common'

const COMPANY_ID = 'techbrabo'
const CONTRACTED_STAGE = 'contracted'

export type TechbraboKpis = {
  recognizedRevenueInPeriod: number
  revenueTarget: number
  achievementPercentage: number
  mrr: number
  activeProjectCount: number
  highRiskProjectCount: number
  pointRevenue: number
  commercialPipeline: number
  weightedPipeline: number
}

function getTechbraboOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return filterByCompany(opportunities, COMPANY_ID)
}

function getOpenOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.filter((opp) => opp.stage !== CONTRACTED_STAGE)
}

function getRevenueTarget(targets: Target[], period: string): number {
  return (
    targets.find(
      (target) =>
        target.companyId === COMPANY_ID &&
        target.period === period &&
        target.metric === 'recognized_revenue',
    )?.targetValue ?? 0
  )
}

function getRevenueForPeriod(
  revenueMonthly: RevenueMonthly[],
  period: string,
): RevenueMonthly | undefined {
  return revenueMonthly.find(
    (entry) => entry.companyId === COMPANY_ID && entry.period === period,
  )
}

export function calculateTechbraboKpis(
  opportunities: Opportunity[],
  techProjects: TechProject[],
  revenueMonthly: RevenueMonthly[],
  targets: Target[],
  period: string,
): TechbraboKpis {
  const techbraboOpportunities = getTechbraboOpportunities(opportunities)
  const openOpportunities = getOpenOpportunities(techbraboOpportunities)
  const activeProjects = techProjects.filter(
    (project) => project.status === 'active',
  )
  const periodRevenue = getRevenueForPeriod(revenueMonthly, period)
  const revenueTarget = getRevenueTarget(targets, period)
  const recognizedRevenueInPeriod = periodRevenue?.recognizedRevenue ?? 0

  return {
    recognizedRevenueInPeriod,
    revenueTarget,
    achievementPercentage: percentage(recognizedRevenueInPeriod, revenueTarget),
    mrr: periodRevenue?.mrr ?? 0,
    activeProjectCount: activeProjects.length,
    highRiskProjectCount: activeProjects.filter(
      (project) => project.risk === 'high',
    ).length,
    pointRevenue: sum(activeProjects.map((project) => project.pointRevenue)),
    commercialPipeline: sum(openOpportunities.map((opp) => opp.value)),
    weightedPipeline: sum(
      openOpportunities.map((opp) => opp.value * opp.probability),
    ),
  }
}

export function calculateTechbraboExecutiveMetrics(
  opportunities: Opportunity[],
  techProjects: TechProject[],
  revenueMonthly: RevenueMonthly[],
  targets: Target[],
  period: string,
  asOfDate: string,
): ExecutiveMetrics {
  const kpis = calculateTechbraboKpis(
    opportunities,
    techProjects,
    revenueMonthly,
    targets,
    period,
  )
  const forecast = calculateLinearPaceForecast(
    kpis.recognizedRevenueInPeriod,
    period,
    asOfDate,
  )

  return buildExecutiveMetrics(
    kpis.recognizedRevenueInPeriod,
    kpis.revenueTarget,
    forecast,
    period,
    asOfDate,
  )
}
