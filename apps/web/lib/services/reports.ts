'use client'

import { buildQuery } from '@/lib/utils'

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
  accountFilter?: 'all' | 'bank_accounts' | 'credit_cards'
}

export interface CategoryReportData {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  categoryColor: string
  categoryIcon: string
  transactionCount: number
  subcategories?: CategoryReportData[]
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
    const qs = buildQuery({
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      type: filters?.type,
    })
    const endpoint = `/reports/categories${qs}`

    return apiClient.get<CategoriesReportResponse>(endpoint)
  },

  async getCashflowReport(
    filters?: CashflowReportFilters,
  ): Promise<CashflowReportResponse> {
    const qs = buildQuery({
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      viewMode: filters?.viewMode,
    })
    const endpoint = `/reports/cashflow${qs}`

    return apiClient.get<CashflowReportResponse>(endpoint)
  },

  async getAccountsReport(
    filters?: AccountsReportFilters,
  ): Promise<AccountsReportResponse> {
    const qs = buildQuery({
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      accountFilter: filters?.accountFilter,
    })
    const endpoint = `/reports/accounts${qs}`

    return apiClient.get<AccountsReportResponse>(endpoint)
  },
}
