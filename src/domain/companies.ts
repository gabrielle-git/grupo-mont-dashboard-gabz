import healthContracts from '../data/healthContracts.json'
import investmentDeals from '../data/investmentDeals.json'
import opportunitiesData from '../data/opportunities.json'
import revenueMonthly from '../data/revenueMonthly.json'
import targets from '../data/targets.json'
import techProjects from '../data/techProjects.json'
import companies from '../data/companies.json'
import type {
  CompanyId,
  HealthContract,
  InvestmentDeal,
  Opportunity,
  RevenueMonthly,
  Target,
  TechProject,
} from '../data/types'
import { buildCommercialCompanyData } from './commercial'
import { calculateMontseguroExecutiveMetrics, calculateMontseguroKpis } from './montseguro'
import { calculateProp5ExecutiveMetrics, calculateProp5Kpis } from './prop5'
import { AS_OF_DATE, REPORTING_PERIOD } from './period'
import { calculateTechbraboExecutiveMetrics, calculateTechbraboKpis } from './techbrabo'

const opportunities = opportunitiesData as Opportunity[]
const typedHealthContracts = healthContracts as HealthContract[]
const typedInvestmentDeals = investmentDeals as InvestmentDeal[]
const typedTargets = targets as Target[]
const typedTechProjects = techProjects as TechProject[]
const typedRevenueMonthly = revenueMonthly as RevenueMonthly[]

export type MontseguroCompanyView = {
  companyId: 'montseguro'
  name: string
  implantedLives: number
  contractedLives: number
  target: number
  forecast: number
  contractCount: number
  averageLivesPerContract: number
  contractedToImplementedRate: number
  bottleneck: string | null
  businessReading: string
}

export type Prop5CompanyView = {
  companyId: 'prop5'
  name: string
  realizedCommission: number
  target: number
  forecast: number
  nominalPipeline: number
  weightedPipeline: number
  projectedCommission: number
  closingRate: number
  averageCycleDays: number | null
  top3Concentration: number
  businessReading: string
}

export type TechbraboCompanyView = {
  companyId: 'techbrabo'
  name: string
  recognizedRevenue: number
  target: number
  forecast: number
  mrr: number
  pointRevenue: number
  activeProjects: number
  highRiskProjects: number
  weightedPipeline: number
  businessReading: string
}

export type CompanyDetailView =
  | MontseguroCompanyView
  | Prop5CompanyView
  | TechbraboCompanyView

const MONTSEGURO_READING =
  'Contratos e vidas não são a mesma coisa: um contrato pode cobrir múltiplas vidas. Implantação é etapa operacional distinta da contratação — nem todo contrato assinado vira vidas implantadas no mesmo período.'

const PROP5_READING =
  'Valor do ativo não é receita. Pipeline representa potencial comercial, não venda realizada. O pipeline ponderado (valor × probabilidade) ajuda a estimar a qualidade e a probabilidade de conversão do funil.'

const TECHBRABO_READING =
  'Contrato assinado não significa receita imediata. Receita pontual e recorrente (MRR) têm dinâmicas diferentes. Novas vendas precisam respeitar a capacidade operacional da equipe.'

export function buildMontseguroCompanyView(): MontseguroCompanyView {
  const kpis = calculateMontseguroKpis(
    opportunities,
    typedHealthContracts,
    typedTargets,
    REPORTING_PERIOD,
  )
  const executive = calculateMontseguroExecutiveMetrics(
    opportunities,
    typedHealthContracts,
    typedTargets,
    REPORTING_PERIOD,
    AS_OF_DATE,
  )
  const commercial = buildCommercialCompanyData('montseguro')

  return {
    companyId: 'montseguro',
    name: companies.find((c) => c.id === 'montseguro')?.name ?? 'Montseguro',
    implantedLives: kpis.implantedLivesInPeriod,
    contractedLives: kpis.contractedLivesInPeriod,
    target: kpis.livesTarget,
    forecast: executive.forecast,
    contractCount: kpis.contractCountInPeriod,
    averageLivesPerContract: kpis.averageLivesPerContract,
    contractedToImplementedRate: kpis.contractedToImplementedConversion,
    bottleneck: commercial.bottleneck
      ? `${commercial.bottleneck.fromLabel} → ${commercial.bottleneck.toLabel}`
      : null,
    businessReading: MONTSEGURO_READING,
  }
}

export function buildProp5CompanyView(): Prop5CompanyView {
  const kpis = calculateProp5Kpis(
    opportunities,
    typedInvestmentDeals,
    typedTargets,
    REPORTING_PERIOD,
  )
  const executive = calculateProp5ExecutiveMetrics(
    opportunities,
    typedInvestmentDeals,
    typedTargets,
    REPORTING_PERIOD,
    AS_OF_DATE,
  )
  const commercial = buildCommercialCompanyData('prop5')

  return {
    companyId: 'prop5',
    name: companies.find((c) => c.id === 'prop5')?.name ?? 'Prop5',
    realizedCommission: kpis.realizedCommissionInPeriod,
    target:
      typedTargets.find(
        (t) =>
          t.companyId === 'prop5' &&
          t.period === REPORTING_PERIOD &&
          t.metric === 'commission_realized',
      )?.targetValue ?? 0,
    forecast: executive.forecast,
    nominalPipeline: kpis.activePipelineNominal,
    weightedPipeline: kpis.weightedPipeline,
    projectedCommission: kpis.projectedCommission,
    closingRate: kpis.closingRate,
    averageCycleDays: commercial.averageCycleDays,
    top3Concentration: kpis.top3WeightedPipelineConcentration,
    businessReading: PROP5_READING,
  }
}

export function buildTechbraboCompanyView(): TechbraboCompanyView {
  const kpis = calculateTechbraboKpis(
    opportunities,
    typedTechProjects,
    typedRevenueMonthly,
    typedTargets,
    REPORTING_PERIOD,
  )
  const executive = calculateTechbraboExecutiveMetrics(
    opportunities,
    typedTechProjects,
    typedRevenueMonthly,
    typedTargets,
    REPORTING_PERIOD,
    AS_OF_DATE,
  )

  return {
    companyId: 'techbrabo',
    name: companies.find((c) => c.id === 'techbrabo')?.name ?? 'TechBrabo',
    recognizedRevenue: kpis.recognizedRevenueInPeriod,
    target: kpis.revenueTarget,
    forecast: executive.forecast,
    mrr: kpis.mrr,
    pointRevenue: kpis.pointRevenue,
    activeProjects: kpis.activeProjectCount,
    highRiskProjects: kpis.highRiskProjectCount,
    weightedPipeline: kpis.weightedPipeline,
    businessReading: TECHBRABO_READING,
  }
}

export function buildCompanyDetailView(
  companyId: CompanyId,
): CompanyDetailView {
  if (companyId === 'montseguro') return buildMontseguroCompanyView()
  if (companyId === 'prop5') return buildProp5CompanyView()
  return buildTechbraboCompanyView()
}
