import healthContracts from '../data/healthContracts.json'
import investmentDeals from '../data/investmentDeals.json'
import opportunitiesData from '../data/opportunities.json'
import revenueMonthly from '../data/revenueMonthly.json'
import targets from '../data/targets.json'
import techProjects from '../data/techProjects.json'
import type {
  HealthContract,
  InvestmentDeal,
  Opportunity,
  RevenueMonthly,
  Target,
  TechProject,
} from '../data/types'
import { EXECUTIVE_STATUS_THRESHOLDS } from './common'
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

export type InsightSeverity = 'positive' | 'warning' | 'critical'

export type InsightCategory =
  | 'meta'
  | 'operacional'
  | 'comercial'
  | 'risco'
  | 'recorrencia'

export type Insight = {
  id: string
  companyId: 'montseguro' | 'prop5' | 'techbrabo'
  companyName: string
  category: InsightCategory
  severity: InsightSeverity
  title: string
  message: string
  relatedMetric: string
  recommendation: string
}

export type InsightsSummary = {
  critical: Insight[]
  warning: Insight[]
  positive: Insight[]
  all: Insight[]
  counts: {
    critical: number
    warning: number
    positive: number
    total: number
  }
}

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

export function generateInsights(): InsightsSummary {
  const insights: Insight[] = []

  const montseguroKpis = calculateMontseguroKpis(
    opportunities,
    typedHealthContracts,
    typedTargets,
    REPORTING_PERIOD,
  )
  const montseguroExec = calculateMontseguroExecutiveMetrics(
    opportunities,
    typedHealthContracts,
    typedTargets,
    REPORTING_PERIOD,
    AS_OF_DATE,
  )
  const montseguroCommercial = buildCommercialCompanyData('montseguro')

  const prop5Kpis = calculateProp5Kpis(
    opportunities,
    typedInvestmentDeals,
    typedTargets,
    REPORTING_PERIOD,
  )
  const prop5Exec = calculateProp5ExecutiveMetrics(
    opportunities,
    typedInvestmentDeals,
    typedTargets,
    REPORTING_PERIOD,
    AS_OF_DATE,
  )

  const techbraboKpis = calculateTechbraboKpis(
    opportunities,
    typedTechProjects,
    typedRevenueMonthly,
    typedTargets,
    REPORTING_PERIOD,
  )
  const techbraboExec = calculateTechbraboExecutiveMetrics(
    opportunities,
    typedTechProjects,
    typedRevenueMonthly,
    typedTargets,
    REPORTING_PERIOD,
    AS_OF_DATE,
  )

  if (montseguroExec.forecastVsTargetPercentage < 100) {
    insights.push({
      id: 'ms-forecast',
      companyId: 'montseguro',
      companyName: 'Montseguro',
      category: 'meta',
      severity:
        montseguroExec.forecastVsTargetPercentage <
        EXECUTIVE_STATUS_THRESHOLDS.yellow
          ? 'critical'
          : 'warning',
      title: 'Forecast abaixo da meta de vidas',
      message: `O forecast de ${formatPct(montseguroExec.forecastVsTargetPercentage)} da meta indica risco de não atingir as ${montseguroKpis.livesTarget} vidas planejadas.`,
      relatedMetric: `Forecast: ${montseguroExec.forecast.toFixed(0)} vidas`,
      recommendation:
        'Reforçar conversão nas etapas finais do funil e acelerar implantações pendentes.',
    })
  }

  if (montseguroCommercial.bottleneck) {
    insights.push({
      id: 'ms-bottleneck',
      companyId: 'montseguro',
      companyName: 'Montseguro',
      category: 'operacional',
      severity: 'warning',
      title: 'Gargalo entre Contratação e Implantação',
      message: `Queda de ${formatPct(montseguroCommercial.bottleneck.dropPercentage)} na transição ${montseguroCommercial.bottleneck.fromLabel} → ${montseguroCommercial.bottleneck.toLabel}. Taxa atual: ${formatPct(montseguroKpis.contractedToImplementedConversion)}.`,
      relatedMetric: `Contratação → Implantação: ${formatPct(montseguroKpis.contractedToImplementedConversion)}`,
      recommendation:
        'Investigar documentação, operadoras e processos operacionais que retardam a implantação.',
    })
  }

  if (prop5Exec.forecastVsTargetPercentage < EXECUTIVE_STATUS_THRESHOLDS.yellow) {
    insights.push({
      id: 'p5-forecast',
      companyId: 'prop5',
      companyName: 'Prop5',
      category: 'meta',
      severity: 'critical',
      title: 'Forecast de comissão abaixo de 85%',
      message: `Forecast em ${formatPct(prop5Exec.forecastVsTargetPercentage)} da meta de comissão — abaixo do patamar mínimo de ${formatPct(EXECUTIVE_STATUS_THRESHOLDS.yellow)}.`,
      relatedMetric: `Realizado: ${formatCurrency(prop5Kpis.realizedCommissionInPeriod)}`,
      recommendation:
        'Priorizar fechamentos com previsão no período e revisar pipeline de oportunidades em negociação.',
    })
  }

  if (prop5Kpis.top3WeightedPipelineConcentration > 40) {
    insights.push({
      id: 'p5-concentration',
      companyId: 'prop5',
      companyName: 'Prop5',
      category: 'risco',
      severity: 'warning',
      title: 'Alta concentração no pipeline ponderado',
      message: `As 3 maiores oportunidades concentram ${formatPct(prop5Kpis.top3WeightedPipelineConcentration)} do pipeline ponderado.`,
      relatedMetric: `Pipeline ponderado: ${formatCurrency(prop5Kpis.weightedPipeline)}`,
      recommendation:
        'Diversificar o funil para reduzir dependência de poucos deals de alto valor.',
    })
  }

  if (
    prop5Kpis.weightedPipeline > prop5Kpis.realizedCommissionInPeriod * 5 &&
    prop5Exec.achievementPercentage < 90
  ) {
    insights.push({
      id: 'p5-pipeline-gap',
      companyId: 'prop5',
      companyName: 'Prop5',
      category: 'comercial',
      severity: 'warning',
      title: 'Pipeline elevado com realizado abaixo da meta',
      message: `Pipeline ponderado de ${formatCurrency(prop5Kpis.weightedPipeline)} contrasta com comissão realizada de ${formatCurrency(prop5Kpis.realizedCommissionInPeriod)} (${formatPct(prop5Exec.achievementPercentage)} da meta).`,
      relatedMetric: `Atingimento: ${formatPct(prop5Exec.achievementPercentage)}`,
      recommendation:
        'Converter oportunidades em estruturação/fechamento ou revisar qualidade do pipeline.',
    })
  }

  if (techbraboExec.forecastVsTargetPercentage >= 100) {
    insights.push({
      id: 'tb-forecast-positive',
      companyId: 'techbrabo',
      companyName: 'TechBrabo',
      category: 'meta',
      severity: 'positive',
      title: 'Forecast acima da meta de receita',
      message: `Forecast de ${formatPct(techbraboExec.forecastVsTargetPercentage)} da meta indica trajetória favorável para receita reconhecida.`,
      relatedMetric: `Forecast: ${formatCurrency(techbraboExec.forecast)}`,
      recommendation:
        'Manter ritmo comercial e monitorar entregas para sustentar o reconhecimento de receita.',
    })
  }

  if (techbraboKpis.highRiskProjectCount > 0) {
    insights.push({
      id: 'tb-high-risk',
      companyId: 'techbrabo',
      companyName: 'TechBrabo',
      category: 'risco',
      severity:
        techbraboKpis.highRiskProjectCount >= 2 ? 'critical' : 'warning',
      title: 'Projetos de alto risco ativos',
      message: `${techbraboKpis.highRiskProjectCount} projeto(s) ativo(s) classificado(s) como alto risco — saúde de meta e saúde operacional são leituras distintas.`,
      relatedMetric: `Projetos ativos: ${techbraboKpis.activeProjectCount}`,
      recommendation:
        'Revisar capacidade, prazos e escopo dos projetos de alto risco antes de novas vendas.',
    })
  }

  if (techbraboKpis.mrr > 0) {
    insights.push({
      id: 'tb-mrr',
      companyId: 'techbrabo',
      companyName: 'TechBrabo',
      category: 'recorrencia',
      severity: 'positive',
      title: 'Base recorrente (MRR) ativa',
      message: `MRR de ${formatCurrency(techbraboKpis.mrr)} indica receita recorrente estruturada além da receita pontual.`,
      relatedMetric: `Receita reconhecida: ${formatCurrency(techbraboKpis.recognizedRevenueInPeriod)}`,
      recommendation:
        'Proteger retenção dos contratos recorrentes e priorizar expansão sobre novos projetos pontuais.',
    })
  }

  const severityOrder: Record<InsightSeverity, number> = {
    critical: 0,
    warning: 1,
    positive: 2,
  }

  const sorted = [...insights].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  )

  return {
    critical: sorted.filter((i) => i.severity === 'critical'),
    warning: sorted.filter((i) => i.severity === 'warning'),
    positive: sorted.filter((i) => i.severity === 'positive'),
    all: sorted,
    counts: {
      critical: sorted.filter((i) => i.severity === 'critical').length,
      warning: sorted.filter((i) => i.severity === 'warning').length,
      positive: sorted.filter((i) => i.severity === 'positive').length,
      total: sorted.length,
    },
  }
}
