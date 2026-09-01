export type CompanyId = 'montseguro' | 'prop5' | 'techbrabo';

export interface Company {
  id: CompanyId;
  name: string;
  segment: string;
}

export interface Campaign {
  id: string;
  companyId: CompanyId;
  name: string;
  channel: string;
  investment: number;
  period: string;
}

export interface Salesperson {
  id: string;
  companyId: CompanyId;
  name: string;
}

export interface Lead {
  id: string;
  companyId: CompanyId;
  campaignId: string;
  salespersonId: string;
  createdAt: string;
  source: string;
  country?: string;
  status: string;
}

export interface StageHistoryItem {
  stage: string;
  date: string;
}

export interface Opportunity {
  id: string;
  companyId: CompanyId;
  leadId: string;
  salespersonId: string;
  stage: string;
  value: number;
  probability: number;
  createdAt: string;
  expectedCloseDate: string;
  stageHistory: StageHistoryItem[];
}

export interface Target {
  id: string;
  companyId: CompanyId;
  period: string;
  metric: string;
  targetValue: number;
  unit: string;
}

export interface HealthContract {
  id: string;
  opportunityId: string;
  operator: string;
  lives: number;
  monthlyPremium: number;
  commissionRate: number;
  contractedAt: string;
  implantedAt: string | null;
  status: 'contracted' | 'implemented';
}

export interface InvestmentDeal {
  id: string;
  opportunityId: string;
  country: string;
  strategy: string;
  assetValue: number;
  structuredVolume: number;
  commissionRate: number;
  projectedCommission: number;
  realizedCommission: number;
  expectedCloseDate: string;
  closedAt: string | null;
}

export interface TechProject {
  id: string;
  opportunityId: string;
  contractValue: number;
  revenueType: 'recurring' | 'project';
  pointRevenue: number;
  mrr: number;
  estimatedCost: number;
  startDate: string;
  deadline: string;
  progressPct: number;
  status: string;
  risk: 'low' | 'medium' | 'high';
  capacityUnits: number;
}

export interface RevenueMonthly {
  companyId: CompanyId;
  period: string;
  recognizedRevenue: number;
  mrr: number;
}
