/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  AccountReportData,
  AccountsReportFilters,
  CashflowReportData,
  CashflowReportFilters,
  CategoriesReportFilters,
  CategoryReportData,
} from '@/repositories/reports.repository'
import { ReportsRepository } from '@/repositories/reports.repository'
import { BaseService } from '@/services/base.service'
import { hasAdvancedReports } from '@/lib/casl'
import { BadRequestError } from '@/routes/_errors/bad-request-error'

// Interface para filtros do serviço (com Date opcional)
interface ServiceCategoriesReportFilters {
  startDate?: Date
  endDate?: Date
  type?: 'income' | 'expense'
  categoryId?: string
}

interface ServiceCashflowReportFilters {
  startDate?: Date
  endDate?: Date
  viewMode?: 'daily' | 'weekly' | 'monthly'
}

interface ServiceAccountsReportFilters {
  startDate?: Date
  endDate?: Date
  accountFilter?: 'all' | 'bank_accounts' | 'credit_cards'
}

export class ReportsService extends BaseService<'entry'> {
  constructor(private reportsRepository: ReportsRepository) {
    // ReportsRepository herda de BaseRepository<'entry'>, então podemos passar o repositório.
    super(reportsRepository as any, (reportsRepository as any).prisma)
  }

  private async checkUserReportAccess(userId: string, isAdvancedReport = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    })

    if (!user) {
      throw new BadRequestError('Usuário não encontrado')
    }

    if (isAdvancedReport && !hasAdvancedReports(user)) {
      throw new BadRequestError(
        'Acesso negado: relatórios avançados disponíveis apenas nos planos pagos. Faça upgrade para acessar esta funcionalidade.'
      )
    }

    return user
  }

  async getCategoriesReport(
    userId: string,
    filters: ServiceCategoriesReportFilters,
    isAdvanced = false,
  ): Promise<{
    categories: (CategoryReportData & { percentage: number })[]
    summary: {
      totalIncome: number
      totalExpense: number
      totalBalance: number
    }
  }> {
    // Verificar acesso do usuário
    await this.checkUserReportAccess(userId, isAdvanced)
    try {
      // Garantir que as datas sejam válidas para o repositório
      const repositoryFilters: CategoriesReportFilters = {
        userId,
        startDate: filters.startDate || new Date(0),
        endDate: filters.endDate || new Date(),
        type: filters.type,
        categoryId: filters.categoryId,
      }

      const categories =
        await this.reportsRepository.getCategoriesReport(repositoryFilters)

      // Usar o método do repositório para calcular totais
      const totals =
        await this.reportsRepository.getCategoriesReportTotals(
          repositoryFilters,
        )
      const totalIncome = totals.totalIncome
      const totalExpense = totals.totalExpense

      const totalBalance = totalIncome - totalExpense

      // Calculate percentages for each category
      const totalAmount = totalIncome + totalExpense
      const categoriesWithPercentage = categories.map((category) => {
        const percentage =
          totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0

        return {
          ...category,
          percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        }
      })

      return {
        categories: categoriesWithPercentage,
        summary: {
          totalIncome,
          totalExpense,
          totalBalance,
        },
      }
    } catch (error) {
      console.error('Error generating categories report:', error)
      throw error
    }
  }

  async getCashflowReport(
    userId: string,
    filters: ServiceCashflowReportFilters,
    isAdvanced = false,
  ): Promise<{
    data: CashflowReportData[]
    summary: {
      totalIncome: number
      totalExpense: number
      totalBalance: number
      averageIncome: number
      averageExpense: number
      averageBalance: number
    }
  }> {
    // Verificar acesso do usuário
    await this.checkUserReportAccess(userId, isAdvanced)
    try {
      // Garantir que as datas sejam válidas para o repositório
      const repositoryFilters: CashflowReportFilters = {
        userId,
        startDate: filters.startDate || new Date(0),
        endDate: filters.endDate || new Date(),
        viewMode: filters.viewMode || 'daily',
      }

      const data =
        await this.reportsRepository.getCashflowReport(repositoryFilters)

      // Calculate summary statistics
      const totalIncome = data.reduce((sum, item) => sum + item.income, 0)
      const totalExpense = data.reduce((sum, item) => sum + item.expense, 0)
      const totalBalance = totalIncome - totalExpense

      const dataLength = data.length || 1 // Avoid division by zero
      const averageIncome = totalIncome / dataLength
      const averageExpense = totalExpense / dataLength
      const averageBalance = totalBalance / dataLength

      return {
        data,
        summary: {
          totalIncome,
          totalExpense,
          totalBalance,
          averageIncome: Math.round(averageIncome * 100) / 100,
          averageExpense: Math.round(averageExpense * 100) / 100,
          averageBalance: Math.round(averageBalance * 100) / 100,
        },
      }
    } catch (error) {
      console.error('Error generating cashflow report:', error)
      throw error
    }
  }

  async getAccountsReport(
    userId: string,
    filters: ServiceAccountsReportFilters,
    isAdvanced = false,
  ): Promise<{
    accounts: (AccountReportData & {
      incomePercentage: number
      expensePercentage: number
    })[]
    summary: {
      totalIncome: number
      totalExpense: number
      totalBalance: number
      bankAccountsBalance: number
      creditCardsBalance: number
    }
  }> {
    // Verificar acesso do usuário
    await this.checkUserReportAccess(userId, isAdvanced)
    try {
      // Usar accountFilter diretamente do filtro recebido
      const repositoryFilters: AccountsReportFilters = {
        userId,
        accountFilter: filters.accountFilter || 'all',
        startDate: filters.startDate || new Date(0),
        endDate: filters.endDate || new Date(),
      }

      const accounts =
        await this.reportsRepository.getAccountsReport(repositoryFilters)

      // Calculate totals
      const totalIncome = accounts.reduce(
        (sum, acc) => sum + acc.totalIncome,
        0,
      )
      const totalExpense = accounts.reduce(
        (sum, acc) => sum + acc.totalExpense,
        0,
      )
      const totalBalance = totalIncome - totalExpense

      // Calculate balances by account type
      const bankAccountsBalance = accounts
        .filter((acc) => acc.accountType === 'bank')
        .reduce((sum, acc) => sum + acc.balance, 0)

      const creditCardsBalance = accounts
        .filter((acc) => acc.accountType === 'credit_card')
        .reduce((sum, acc) => sum + acc.balance, 0)

      // Add percentage calculation for each account
      const accountsWithPercentage = accounts.map((account) => {
        const incomePercentage =
          totalIncome > 0 ? (account.totalIncome / totalIncome) * 100 : 0
        const expensePercentage =
          totalExpense > 0 ? (account.totalExpense / totalExpense) * 100 : 0

        return {
          ...account,
          incomePercentage: Math.round(incomePercentage * 100) / 100,
          expensePercentage: Math.round(expensePercentage * 100) / 100,
        }
      })

      return {
        accounts: accountsWithPercentage,
        summary: {
          totalIncome,
          totalExpense,
          totalBalance,
          bankAccountsBalance,
          creditCardsBalance,
        },
      }
    } catch (error) {
      console.error('Error generating accounts report:', error)
      throw error
    }
  }
}
