import { apiClient } from '@/lib/api'
import type {
  GeneralOverview,
  QuickStats,
  TopExpensesByCategory,
  TopExpensesQueryParams,
} from '@/lib/types'
import { buildQuery } from '@/lib/utils'

// Helper function to convert API response (no conversion needed for dueDate as it's already timestamp)
function convertOverviewFromApi(overview: GeneralOverview): GeneralOverview {
  return overview // No conversion needed, dueDate is already timestamp in seconds
}

function convertTopExpensesFromApi(
  topExpenses: TopExpensesByCategory,
): TopExpensesByCategory {
  return {
    ...topExpenses,
    dateRange: {
      startDate: topExpenses.dateRange.startDate, // Already in seconds from API
      endDate: topExpenses.dateRange.endDate, // Already in seconds from API
    },
  }
}

export const overviewService = {
  // Buscar resumo geral (receitas, despesas, contas a pagar/receber do mês atual)
  async getGeneralOverview(): Promise<GeneralOverview> {
    const overview = await apiClient.get<GeneralOverview>('/overview')
    return convertOverviewFromApi(overview)
  },

  // Buscar maiores gastos por categoria pai
  async getTopExpensesByCategory(
    params?: TopExpensesQueryParams,
  ): Promise<TopExpensesByCategory> {
    const qs = buildQuery({ period: params?.period }, { cacheBust: true })
    const endpoint = `/overview/top-expenses${qs}`
    const topExpenses = await apiClient.get<TopExpensesByCategory>(endpoint)
    return convertTopExpensesFromApi(topExpenses)
  },

  // Buscar estatísticas rápidas
  async getQuickStats(): Promise<QuickStats> {
    return apiClient.get<QuickStats>('/overview/stats')
  },
}
