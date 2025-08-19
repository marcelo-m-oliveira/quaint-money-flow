import { redirect } from 'next/navigation'

import { FinancialDashboard } from '@/components/financial-dashboard'
import { getServerSession } from '@/lib/api-auth'
import { OverviewProvider } from '@/lib/contexts/overview-context'

export default async function Home() {
  const session = await getServerSession()
  if (!session) {
    redirect('/signin')
  }
  return (
    <OverviewProvider>
      <FinancialDashboard />
    </OverviewProvider>
  )
}
