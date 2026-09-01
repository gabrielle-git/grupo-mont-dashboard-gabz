import { useState } from 'react'
import type { CompanyId } from '../data/types'
import {
  MontseguroCompanyPanel,
  Prop5CompanyPanel,
  TechbraboCompanyPanel,
} from '../components/companies/CompanyPanels'
import { PageTabs } from '../components/shared/PageTabs'
import { COMPANY_TABS } from '../components/shared/pageTabsConfig'
import { buildCompanyDetailView } from '../domain/companies'

export function CompaniesPage() {
  const [activeTab, setActiveTab] = useState<CompanyId>('montseguro')
  const data = buildCompanyDetailView(activeTab)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Empresas</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Compare o desempenho das empresas do grupo para decisões de portfólio
          e alocação de capital.
        </p>
      </div>

      <PageTabs
        tabs={COMPANY_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {data.companyId === 'montseguro' && (
        <MontseguroCompanyPanel key="montseguro" data={data} />
      )}
      {data.companyId === 'prop5' && (
        <Prop5CompanyPanel key="prop5" data={data} />
      )}
      {data.companyId === 'techbrabo' && (
        <TechbraboCompanyPanel key="techbrabo" data={data} />
      )}
    </div>
  )
}
