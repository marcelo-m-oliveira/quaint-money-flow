import { apiClient } from '@/lib/api'
import type {
  GeneralOverview,
  QuickStats,
  TopExpensesByCategory,
  TopExpensesQueryParams,
} from '@/lib/types'

// Helper function to convert API response timestamps to proper format
function convertOverviewFromApi(overview: GeneralOverview): GeneralOverview {
  return {
    ...overview,
    accountsPayable: overview.accountsPayable.map((account) => ({
      ...account,
      dueDate: account.dueDate, // Already in seconds from API
    })),
    accountsReceivable: overview.accountsReceivable.map((account) => ({
      ...account,
      dueDate: account.dueDate, // Already in seconds from API
    })),
  }
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
    const searchParams = new URLSearchParams()

    if (params?.period) {
      searchParams.append('period', params.period)
    }

    // Adicionar cache-busting para forçar nova requisição
    searchParams.append('_t', Date.now().toString())

    const endpoint = `/overview/top-expenses?${searchParams.toString()}`
    const topExpenses = await apiClient.get<TopExpensesByCategory>(endpoint)
    return convertTopExpensesFromApi(topExpenses)
  },

  // Buscar estatísticas rápidas
  async getQuickStats(): Promise<QuickStats> {
    return apiClient.get<QuickStats>('/overview/stats')
  },
}
