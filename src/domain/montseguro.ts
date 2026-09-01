import type {
  HealthContract,
  Opportunity,
  StageHistoryItem,
  Target,
} from '../data/types'
import {
  average,
  buildExecutiveMetrics,
  calculateLinearPaceForecast,
  type ExecutiveMetrics,
  filterByCompany,
  isInPeriod,
  percentage,
  sum,
} from './common'

const COMPANY_ID = 'montseguro'

export type MontseguroKpis = {
  opportunitiesByStage: Record<string, number>
  contractedLivesInPeriod: number
  implantedLivesInPeriod: number
  contractCountInPeriod: number
  averageLivesPerContract: number
  quoteToProposalConversion: number
  proposalToContractedConversion: number
  contractedToImplementedConversion: number
  livesTarget: number
  achievementPercentage: number
}

function getMontseguroOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return filterByCompany(opportunities, COMPANY_ID)
}

function getStageDate(
  history: StageHistoryItem[],
  stage: string,
): string | undefined {
  return history.find((item) => item.stage === stage)?.date
}

function enteredStageInPeriod(
  history: StageHistoryItem[],
  stage: string,
  period: string,
): boolean {
  const date = getStageDate(history, stage)
  return isInPeriod(date, period)
}

function reachedStageAfter(
  history: StageHistoryItem[],
  fromStage: string,
  toStage: string,
): boolean {
  const fromDate = getStageDate(history, fromStage)
  const toDate = getStageDate(history, toStage)
  if (!fromDate || !toDate) return false
  return toDate >= fromDate
}

function calculateStageConversion(
  opportunities: Opportunity[],
  fromStage: string,
  toStage: string,
  period: string,
): number {
  const enteredFrom = opportunities.filter((opp) =>
    enteredStageInPeriod(opp.stageHistory, fromStage, period),
  )

  if (enteredFrom.length === 0) return 0

  const converted = enteredFrom.filter((opp) =>
    reachedStageAfter(opp.stageHistory, fromStage, toStage),
  )

  return percentage(converted.length, enteredFrom.length)
}

function getLivesTarget(targets: Target[], period: string): number {
  return (
    targets.find(
      (target) =>
        target.companyId === COMPANY_ID &&
        target.period === period &&
        target.metric === 'implanted_lives',
    )?.targetValue ?? 0
  )
}

export function calculateMontseguroKpis(
  opportunities: Opportunity[],
  healthContracts: HealthContract[],
  targets: Target[],
  period: string,
): MontseguroKpis {
  const montseguroOpportunities = getMontseguroOpportunities(opportunities)

  const contractsInPeriod = healthContracts.filter((contract) =>
    isInPeriod(contract.contractedAt, period),
  )

  const implantedInPeriod = healthContracts.filter((contract) =>
    isInPeriod(contract.implantedAt, period),
  )

  const contractedLivesInPeriod = sum(
    contractsInPeriod.map((contract) => contract.lives),
  )

  const implantedLivesInPeriod = sum(
    implantedInPeriod.map((contract) => contract.lives),
  )

  const livesTarget = getLivesTarget(targets, period)

  return {
    opportunitiesByStage: groupOpportunitiesByStage(montseguroOpportunities),
    contractedLivesInPeriod,
    implantedLivesInPeriod,
    contractCountInPeriod: contractsInPeriod.length,
    averageLivesPerContract: average(
      contractsInPeriod.map((contract) => contract.lives),
    ),
    quoteToProposalConversion: calculateStageConversion(
      montseguroOpportunities,
      'quote',
      'proposal',
      period,
    ),
    proposalToContractedConversion: calculateStageConversion(
      montseguroOpportunities,
      'proposal',
      'contracted',
      period,
    ),
    contractedToImplementedConversion: percentage(
      contractsInPeriod.filter((contract) =>
        isInPeriod(contract.implantedAt, period),
      ).length,
      contractsInPeriod.length,
    ),
    livesTarget,
    achievementPercentage: percentage(implantedLivesInPeriod, livesTarget),
  }
}

export function calculateMontseguroExecutiveMetrics(
  opportunities: Opportunity[],
  healthContracts: HealthContract[],
  targets: Target[],
  period: string,
  asOfDate: string,
): ExecutiveMetrics {
  const kpis = calculateMontseguroKpis(
    opportunities,
    healthContracts,
    targets,
    period,
  )
  const forecast = calculateLinearPaceForecast(
    kpis.implantedLivesInPeriod,
    period,
    asOfDate,
  )

  return buildExecutiveMetrics(
    kpis.implantedLivesInPeriod,
    kpis.livesTarget,
    forecast,
    period,
    asOfDate,
  )
}

function groupOpportunitiesByStage(
  opportunities: Opportunity[],
): Record<string, number> {
  return opportunities.reduce<Record<string, number>>((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] ?? 0) + 1
    return acc
  }, {})
}
