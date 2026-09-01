import { useState } from 'react'
import type { CompanyId } from '../data/types'
import {
  MarketingCompanyView,
  MarketingGroupView,
} from '../components/marketing/MarketingViews'
import { PageTabs } from '../components/shared/PageTabs'
import { MARKETING_TABS } from '../components/shared/pageTabsConfig'
import {
  buildMarketingCompanyData,
  buildMarketingGroupSummary,
} from '../domain/marketing'

type MarketingTab = 'group' | CompanyId

export function MarketingPage() {
  const [activeTab, setActiveTab] = useState<MarketingTab>('group')
  const groupSummary = buildMarketingGroupSummary()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Marketing</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Entenda o retorno das campanhas para otimizar budget e canais de
          aquisição.
        </p>
      </div>

      <PageTabs
        tabs={MARKETING_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'group' ? (
        <MarketingGroupView companies={groupSummary.companies} />
      ) : (
        <MarketingCompanyView
          key={activeTab}
          data={buildMarketingCompanyData(activeTab)}
        />
      )}
    </div>
  )
}
