import { PrismaClient } from '@prisma/client'

import { OverviewRepository } from '@/repositories/overview.repository'

export class OverviewService {
  constructor(
    private overviewRepository: OverviewRepository,
    private prisma: PrismaClient,
  ) {}

  async getGeneralOverview(userId: string) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const data = await this.overviewRepository.getMonthlyOverview(
      userId,
      currentYear,
      currentMonth,
    )

    // Processar receitas e despesas do mês
    let monthlyIncome = 0
    let monthlyExpenses = 0

    data.monthlyEntries.forEach((entry) => {
      const amount = Number(entry._sum.amount || 0)
      if (entry.type === 'income') {
        monthlyIncome += amount
      } else if (entry.type === 'expense') {
        monthlyExpenses += amount
      }
    })

    // Processar contas a pagar
    const accountsPayable = data.accountsPayable.map((account) => ({
      id: account.id,
      description: account.description,
      amount: Number(account.amount),
      date: account.date,
      type: account.type,
      accountId: account.accountId || '',
      creditCardId: account.creditCardId || '',
      categoryId: account.category?.id || '',
      categoryName: account.category?.name || 'Sem categoria',
      icon: account.category?.icon || '',
      color: account.category?.color || '',
      isOverdue: account.date < new Date(),
    }))

    // Processar contas a receber
    const accountsReceivable = data.accountsReceivable.map((account) => ({
      id: account.id,
      description: account.description,
      amount: Number(account.amount),
      date: account.date,
      type: account.type,
      accountId: account.accountId || '',
      creditCardId: account.creditCardId || '',
      categoryId: account.category?.id || '',
      categoryName: account.category?.name || 'Sem categoria',
      icon: account.category?.icon || '',
      color: account.category?.color || '',
      isOverdue: account.date < new Date(),
    }))

    // Calcular totais das contas pendentes
    const totalAccountsPayable = accountsPayable.reduce(
      (sum, account) => sum + account.amount,
      0,
    )
    const totalAccountsReceivable = accountsReceivable.reduce(
      (sum, account) => sum + account.amount,
      0,
    )

    return {
      monthlyIncome,
      monthlyExpenses,
      totalAccountsPayable,
      totalAccountsReceivable,
      accountsPayable,
      accountsReceivable,
      period: {
        year: currentYear,
        month: currentMonth,
      },
    }
  }

  async getTopExpensesByCategory(
    userId: string,
    period: string = 'current-month',
  ) {
    // Validar período
    const validPeriods = [
      'current-month',
      'last-15-days',
      'last-30-days',
      'last-3-months',
      'last-6-months',
    ]

    if (!validPeriods.includes(period)) {
      throw new Error(
        `Período inválido. Períodos válidos: ${validPeriods.join(', ')}`,
      )
    }

    // Obter range de datas para o período
    const { startDate, endDate } =
      this.overviewRepository.getDateRangeForPeriod(period)

    // Buscar maiores gastos por categoria
    const topExpenses = await this.overviewRepository.getTopExpensesByCategory(
      userId,
      startDate,
      endDate,
    )

    return {
      expenses: topExpenses,
      period,
      dateRange: {
        startDate,
        endDate,
      },
      totalExpenses: topExpenses.reduce(
        (sum, expense) => sum + expense.totalAmount,
        0,
      ),
    }
  }

  // Método auxiliar para obter estatísticas rápidas
  async getQuickStats(userId: string) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Buscar dados do mês atual
    const monthlyData = await this.overviewRepository.getMonthlyOverview(
      userId,
      currentYear,
      currentMonth,
    )

    // Contar contas vencidas
    const overduePayable = monthlyData.accountsPayable.filter(
      (account) => account.date < new Date(),
    ).length

    const overdueReceivable = monthlyData.accountsReceivable.filter(
      (account) => account.date < new Date(),
    ).length

    // Calcular saldo do mês
    let monthlyIncome = 0
    let monthlyExpenses = 0

    monthlyData.monthlyEntries.forEach((entry) => {
      const amount = Number(entry._sum.amount || 0)
      if (entry.type === 'income') {
        monthlyIncome += amount
      } else if (entry.type === 'expense') {
        monthlyExpenses += amount
      }
    })

    const monthlyBalance = monthlyIncome - monthlyExpenses

    return {
      monthlyBalance,
      overduePayable,
      overdueReceivable,
      totalPendingPayable: monthlyData.accountsPayable.length,
      totalPendingReceivable: monthlyData.accountsReceivable.length,
    }
  }
}
