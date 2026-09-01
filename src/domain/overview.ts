import companies from '../data/companies.json'
import healthContracts from '../data/healthContracts.json'
import investmentDeals from '../data/investmentDeals.json'
import opportunitiesData from '../data/opportunities.json'
import revenueMonthly from '../data/revenueMonthly.json'
import targets from '../data/targets.json'
import techProjects from '../data/techProjects.json'
import type {
  CompanyId,
  HealthContract,
  InvestmentDeal,
  Opportunity,
  RevenueMonthly,
  Target,
  TechProject,
} from '../data/types'
import type { ExecutiveMetrics } from './common'
import { calculateMontseguroExecutiveMetrics } from './montseguro'
import { AS_OF_DATE, REPORTING_PERIOD } from './period'
import { calculateProp5ExecutiveMetrics } from './prop5'
import { calculateTechbraboExecutiveMetrics } from './techbrabo'

const opportunities = opportunitiesData as Opportunity[]
const typedHealthContracts = healthContracts as HealthContract[]
const typedInvestmentDeals = investmentDeals as InvestmentDeal[]
const typedTargets = targets as Target[]
const typedTechProjects = techProjects as TechProject[]
const typedRevenueMonthly = revenueMonthly as RevenueMonthly[]

export type CompanyOverview = {
  companyId: CompanyId
  name: string
  primaryMetric: string
  realized: number
  target: number
  achievementPercentage: number
  expectedTargetToDate: number
  gapToExpected: number
  forecast: number
  forecastVsTargetPercentage: number
  executiveStatus: ExecutiveMetrics['executiveStatus']
}

const PRIMARY_METRICS: Record<CompanyId, string> = {
  montseguro: 'Vidas implantadas',
  prop5: 'Comissão realizada',
  techbrabo: 'Receita reconhecida',
}

function buildCompanyOverview(
  companyId: CompanyId,
  name: string,
  metrics: ExecutiveMetrics,
): CompanyOverview {
  return {
    companyId,
    name,
    primaryMetric: PRIMARY_METRICS[companyId],
    realized: metrics.realized,
    target: metrics.target,
    achievementPercentage: metrics.achievementPercentage,
    expectedTargetToDate: metrics.expectedTargetToDate,
    gapToExpected: metrics.gapToExpected,
    forecast: metrics.forecast,
    forecastVsTargetPercentage: metrics.forecastVsTargetPercentage,
    executiveStatus: metrics.executiveStatus,
  }
}

export function buildGroupOverview(
  period: string = REPORTING_PERIOD,
  asOfDate: string = AS_OF_DATE,
): CompanyOverview[] {
  const montseguro = calculateMontseguroExecutiveMetrics(
    opportunities,
    typedHealthContracts,
    typedTargets,
    period,
    asOfDate,
  )
  const prop5 = calculateProp5ExecutiveMetrics(
    opportunities,
    typedInvestmentDeals,
    typedTargets,
    period,
    asOfDate,
  )
  const techbrabo = calculateTechbraboExecutiveMetrics(
    opportunities,
    typedTechProjects,
    typedRevenueMonthly,
    typedTargets,
    period,
    asOfDate,
  )

  const metricsByCompany: Record<CompanyId, ExecutiveMetrics> = {
    montseguro,
    prop5,
    techbrabo,
  }

  return companies.map((company) => {
    const companyId = company.id as CompanyId
    return buildCompanyOverview(
      companyId,
      company.name,
      metricsByCompany[companyId],
    )
  })
}
