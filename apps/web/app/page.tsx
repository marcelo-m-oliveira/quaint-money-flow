import { FinancialDashboard } from '@/components/financial-dashboard'
import { OverviewProvider } from '@/lib/contexts/overview-context'

export default function Home() {
  return (
    <OverviewProvider>
      <FinancialDashboard />
    </OverviewProvider>
  )
}
