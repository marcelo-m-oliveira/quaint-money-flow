'use client'

import { apiClient } from '../api'

export interface ReportFilters {
  startDate?: number // timestamp em segundos
  endDate?: number // timestamp em segundos
}

export interface CategoriesReportFilters extends ReportFilters {
  type?: 'income' | 'expense'
}

export interface CashflowReportFilters extends ReportFilters {
  viewMode?: 'daily' | 'weekly' | 'monthly'
}

export interface AccountsReportFilters extends ReportFilters {
  accountType?: 'all' | 'bank_accounts' | 'credit_cards'
}

export interface CategoryReportData {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  categoryColor: string
  categoryIcon: string
  transactionCount: number
}

export interface CashflowReportData {
  date: string
  income: number
  expense: number
  balance: number
}

export interface AccountReportData {
  accountId: string
  accountName: string
  accountType: string
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  icon: string
  iconType: 'bank' | 'generic'
}

export interface CategoriesReportResponse {
  categories: CategoryReportData[]
  summary: {
    totalIncome: number
    totalExpense: number
    totalBalance: number
  }
}

export interface CashflowReportResponse {
  data: CashflowReportData[]
  summary: {
    totalIncome: number
    totalExpense: number
    totalBalance: number
    averageIncome: number
    averageExpense: number
    averageBalance: number
  }
}

export interface AccountsReportResponse {
  accounts: AccountReportData[]
  totalBalance: number
  totalTransactions: number
}

export const reportsService = {
  async getCategoriesReport(
    filters?: CategoriesReportFilters,
  ): Promise<CategoriesReportResponse> {
    const params = new URLSearchParams()

    if (filters?.startDate) {
      params.append('startDate', filters.startDate.toString())
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate.toString())
    }
    if (filters?.type) {
      params.append('type', filters.type)
    }

    const queryString = params.toString()
    const endpoint = `/reports/categories${queryString ? `?${queryString}` : ''}`

    return apiClient.get<CategoriesReportResponse>(endpoint)
  },

  async getCashflowReport(
    filters?: CashflowReportFilters,
  ): Promise<CashflowReportResponse> {
    const params = new URLSearchParams()

    if (filters?.startDate) {
      params.append('startDate', filters.startDate.toString())
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate.toString())
    }
    if (filters?.viewMode) {
      params.append('viewMode', filters.viewMode)
    }

    const queryString = params.toString()
    const endpoint = `/reports/cashflow${queryString ? `?${queryString}` : ''}`

    return apiClient.get<CashflowReportResponse>(endpoint)
  },

  async getAccountsReport(
    filters?: AccountsReportFilters,
  ): Promise<AccountsReportResponse> {
    const params = new URLSearchParams()

    if (filters?.startDate) {
      params.append('startDate', filters.startDate.toString())
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate.toString())
    }
    if (filters?.accountType) {
      params.append('accountType', filters.accountType)
    }

    const queryString = params.toString()
    const endpoint = `/reports/accounts${queryString ? `?${queryString}` : ''}`

    return apiClient.get<AccountsReportResponse>(endpoint)
  },
}
