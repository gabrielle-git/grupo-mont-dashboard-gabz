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
import { ExecutiveCompanyCard } from '../components/dashboard/ExecutiveCompanyCard'
import { ExecutiveComparisonChart } from '../components/dashboard/ExecutiveComparisonChart'
import { PriorityActions } from '../components/dashboard/PriorityActions'
import { calculateMontseguroKpis } from '../domain/montseguro'
import { buildGroupOverview } from '../domain/overview'
import { AS_OF_DATE, REPORTING_PERIOD } from '../domain/period'
import { calculateProp5Kpis } from '../domain/prop5'
import { calculateTechbraboKpis } from '../domain/techbrabo'
import { formatAsOfDate } from '../utils/format'

const opportunities = opportunitiesData as Opportunity[]
const typedHealthContracts = healthContracts as HealthContract[]
const typedInvestmentDeals = investmentDeals as InvestmentDeal[]
const typedTargets = targets as Target[]
const typedTechProjects = techProjects as TechProject[]
const typedRevenueMonthly = revenueMonthly as RevenueMonthly[]

export function OverviewPage() {
  const companies = buildGroupOverview(REPORTING_PERIOD, AS_OF_DATE)

  const montseguroKpis = calculateMontseguroKpis(
    opportunities,
    typedHealthContracts,
    typedTargets,
    REPORTING_PERIOD,
  )
  const prop5Kpis = calculateProp5Kpis(
    opportunities,
    typedInvestmentDeals,
    typedTargets,
    REPORTING_PERIOD,
  )
  const techbraboKpis = calculateTechbraboKpis(
    opportunities,
    typedTechProjects,
    typedRevenueMonthly,
    typedTargets,
    REPORTING_PERIOD,
  )

  const prop5Executive = companies.find((company) => company.companyId === 'prop5')
  const prop5HasAugustClosuresExpected =
    prop5Executive !== undefined &&
    prop5Executive.forecast > prop5Executive.realized

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <h2 className="text-2xl font-semibold text-slate-900">CEO Overview</h2>
          <p className="text-sm text-slate-500">
            Posição em {formatAsOfDate(AS_OF_DATE)}
          </p>
        </div>
        <p className="mt-2 max-w-2xl text-slate-600">
          Visão consolidada para priorizar investimentos e alinhar as áreas do
          grupo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {companies.map((company) => (
          <ExecutiveCompanyCard key={company.companyId} company={company} />
        ))}
      </div>

      <ExecutiveComparisonChart companies={companies} />

      <PriorityActions
        companies={companies}
        prop5Top3Concentration={prop5Kpis.top3WeightedPipelineConcentration}
        prop5HasAugustClosuresExpected={prop5HasAugustClosuresExpected}
        montseguroContractedToImplemented={
          montseguroKpis.contractedToImplementedConversion
        }
        techbraboHighRiskCount={techbraboKpis.highRiskProjectCount}
      />
    </div>
  )
}
