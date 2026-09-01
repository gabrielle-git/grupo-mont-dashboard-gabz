import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CommercialPage } from './pages/CommercialPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { InsightsPage } from './pages/InsightsPage'
import { MarketingPage } from './pages/MarketingPage'
import { OverviewPage } from './pages/OverviewPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="comercial" element={<CommercialPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="empresas" element={<CompaniesPage />} />
          <Route path="insights" element={<InsightsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
