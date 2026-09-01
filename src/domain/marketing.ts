import campaignsData from '../data/campaigns.json'
import leadsData from '../data/leads.json'
import opportunitiesData from '../data/opportunities.json'
import companies from '../data/companies.json'
import type { Campaign, CompanyId, Lead, Opportunity } from '../data/types'
import { percentage, safeDivide, sum } from './common'
import { REPORTING_PERIOD } from './period'

const campaigns = campaignsData as Campaign[]
const leads = leadsData as Lead[]
const opportunities = opportunitiesData as Opportunity[]

const FINAL_STAGE: Record<CompanyId, string> = {
  montseguro: 'implemented',
  prop5: 'closed',
  techbrabo: 'contracted',
}

const BUSINESS_NOTES: Record<CompanyId, string> = {
  montseguro:
    'Investimento em marketing gera leads; o resultado comercial depende da conversão no funil de vendas.',
  prop5:
    'Valor da oportunidade atribuída a campanha não representa receita ou comissão realizada.',
  techbrabo:
    'Pipeline gerado por campanha não equivale a receita reconhecida no período.',
}

export type CampaignMetrics = {
  campaignId: string
  campaignName: string
  channel: string
  investment: number
  leads: number
  qualifiedLeads: number
  opportunities: number
  cpl: number
  costPerOpportunity: number | null
  leadToOpportunityRate: number
  finalDeals: number
  costPerFinalDeal: number | null
}

export type ChannelMetrics = {
  channel: string
  investment: number
  leads: number
  qualifiedLeads: number
  opportunities: number
  cpl: number
  costPerOpportunity: number | null
  leadToOpportunityRate: number
  finalDeals: number
  costPerFinalDeal: number | null
}

export type MarketingCompanySummary = {
  companyId: CompanyId
  name: string
  totalInvestment: number
  totalLeads: number
  totalQualifiedLeads: number
  totalOpportunities: number
  averageCpl: number
  averageCostPerOpportunity: number | null
  averageLeadToOpportunityRate: number
  totalFinalDeals: number
  averageCostPerFinalDeal: number | null
  campaigns: CampaignMetrics[]
  channels: ChannelMetrics[]
  bestChannel: string | null
  worstEfficiencyChannel: string | null
  businessNote: string
}

export type MarketingGroupSummary = {
  companies: MarketingCompanySummary[]
}

function getOpportunityForLead(leadId: string): Opportunity | undefined {
  return opportunities.find((opportunity) => opportunity.leadId === leadId)
}

function hasReachedStage(opportunity: Opportunity, stage: string): boolean {
  return opportunity.stageHistory.some((item) => item.stage === stage)
}

function isQualifiedLead(lead: Lead): boolean {
  const opportunity = getOpportunityForLead(lead.id)
  return opportunity ? hasReachedStage(opportunity, 'qualified') : false
}

function isFinalDeal(lead: Lead, companyId: CompanyId): boolean {
  const opportunity = getOpportunityForLead(lead.id)
  if (!opportunity) return false
  return hasReachedStage(opportunity, FINAL_STAGE[companyId])
}

function buildCampaignMetrics(
  campaign: Campaign,
  companyId: CompanyId,
): CampaignMetrics {
  const campaignLeads = leads.filter(
    (lead) => lead.campaignId === campaign.id && lead.companyId === companyId,
  )

  const campaignOpportunities = campaignLeads
    .map((lead) => getOpportunityForLead(lead.id))
    .filter((opportunity): opportunity is Opportunity => opportunity !== undefined)

  const qualifiedLeads = campaignLeads.filter(isQualifiedLead).length
  const finalDeals = campaignLeads.filter((lead) =>
    isFinalDeal(lead, companyId),
  ).length
  const opportunityCount = campaignOpportunities.length

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    channel: campaign.channel,
    investment: campaign.investment,
    leads: campaignLeads.length,
    qualifiedLeads,
    opportunities: opportunityCount,
    cpl: safeDivide(campaign.investment, campaignLeads.length),
    costPerOpportunity:
      opportunityCount > 0
        ? safeDivide(campaign.investment, opportunityCount)
        : null,
    leadToOpportunityRate: percentage(opportunityCount, campaignLeads.length),
    finalDeals,
    costPerFinalDeal:
      finalDeals > 0 ? safeDivide(campaign.investment, finalDeals) : null,
  }
}

function aggregateChannels(campaignMetrics: CampaignMetrics[]): ChannelMetrics[] {
  const byChannel = new Map<string, CampaignMetrics[]>()

  for (const campaign of campaignMetrics) {
    const existing = byChannel.get(campaign.channel) ?? []
    existing.push(campaign)
    byChannel.set(campaign.channel, existing)
  }

  return Array.from(byChannel.entries()).map(([channel, items]) => {
    const investment = sum(items.map((item) => item.investment))
    const leadCount = sum(items.map((item) => item.leads))
    const qualifiedLeads = sum(items.map((item) => item.qualifiedLeads))
    const opportunityCount = sum(items.map((item) => item.opportunities))
    const finalDeals = sum(items.map((item) => item.finalDeals))

    return {
      channel,
      investment,
      leads: leadCount,
      qualifiedLeads,
      opportunities: opportunityCount,
      cpl: safeDivide(investment, leadCount),
      costPerOpportunity:
        opportunityCount > 0 ? safeDivide(investment, opportunityCount) : null,
      leadToOpportunityRate: percentage(opportunityCount, leadCount),
      finalDeals,
      costPerFinalDeal:
        finalDeals > 0 ? safeDivide(investment, finalDeals) : null,
    }
  })
}

function findBestChannel(channels: ChannelMetrics[]): string | null {
  const withOpportunities = channels.filter(
    (channel) => channel.opportunities > 0 && channel.costPerOpportunity !== null,
  )
  if (withOpportunities.length === 0) return null

  return withOpportunities.reduce((best, current) =>
    (current.costPerOpportunity ?? Infinity) < (best.costPerOpportunity ?? Infinity)
      ? current
      : best,
  ).channel
}

function findWorstEfficiencyChannel(channels: ChannelMetrics[]): string | null {
  const withOpportunities = channels.filter(
    (channel) => channel.opportunities > 0 && channel.costPerOpportunity !== null,
  )
  if (withOpportunities.length === 0) return null

  return withOpportunities.reduce((worst, current) =>
    (current.costPerOpportunity ?? 0) > (worst.costPerOpportunity ?? 0)
      ? current
      : worst,
  ).channel
}

function buildMarketingCompanySummary(
  companyId: CompanyId,
): MarketingCompanySummary {
  const companyCampaigns = campaigns.filter(
    (campaign) =>
      campaign.companyId === companyId && campaign.period === REPORTING_PERIOD,
  )
  const campaignMetrics = companyCampaigns.map((campaign) =>
    buildCampaignMetrics(campaign, companyId),
  )
  const channels = aggregateChannels(campaignMetrics)

  const totalInvestment = sum(campaignMetrics.map((item) => item.investment))
  const totalLeads = sum(campaignMetrics.map((item) => item.leads))
  const totalQualifiedLeads = sum(
    campaignMetrics.map((item) => item.qualifiedLeads),
  )
  const totalOpportunities = sum(
    campaignMetrics.map((item) => item.opportunities),
  )
  const totalFinalDeals = sum(campaignMetrics.map((item) => item.finalDeals))

  return {
    companyId,
    name:
      companies.find((company) => company.id === companyId)?.name ?? companyId,
    totalInvestment,
    totalLeads,
    totalQualifiedLeads,
    totalOpportunities,
    averageCpl: safeDivide(totalInvestment, totalLeads),
    averageCostPerOpportunity:
      totalOpportunities > 0
        ? safeDivide(totalInvestment, totalOpportunities)
        : null,
    averageLeadToOpportunityRate: percentage(
      totalOpportunities,
      totalLeads,
    ),
    totalFinalDeals,
    averageCostPerFinalDeal:
      totalFinalDeals > 0
        ? safeDivide(totalInvestment, totalFinalDeals)
        : null,
    campaigns: campaignMetrics,
    channels,
    bestChannel: findBestChannel(channels),
    worstEfficiencyChannel: findWorstEfficiencyChannel(channels),
    businessNote: BUSINESS_NOTES[companyId],
  }
}

export function buildMarketingGroupSummary(): MarketingGroupSummary {
  const companyIds: CompanyId[] = ['montseguro', 'prop5', 'techbrabo']
  return {
    companies: companyIds.map((companyId) =>
      buildMarketingCompanySummary(companyId),
    ),
  }
}

export function buildMarketingCompanyData(
  companyId: CompanyId,
): MarketingCompanySummary {
  return buildMarketingCompanySummary(companyId)
}
