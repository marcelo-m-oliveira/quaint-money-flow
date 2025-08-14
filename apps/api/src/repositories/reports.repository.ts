import { Prisma, PrismaClient } from '@prisma/client'

import { BaseRepository } from './base.repository'

export interface CategoriesReportFilters {
  userId: string
  startDate: Date
  endDate: Date
  type?: 'income' | 'expense'
  categoryId?: string
}

export interface CashflowReportFilters {
  userId: string
  startDate: Date
  endDate: Date
  viewMode: 'daily' | 'weekly' | 'monthly'
}

export interface AccountsReportFilters {
  userId: string
  startDate: Date
  endDate: Date
  accountFilter: 'all' | 'bank_accounts' | 'credit_cards'
}

export interface CategoryReportData {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  parentId: string | null
  amount: number
  transactionCount: number
}

export interface CashflowReportData {
  date: string
  income: number
  expense: number
  balance: number
  period: string
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

export class ReportsRepository extends BaseRepository<'entry'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'entry')
  }

  async getCategoriesReport(
    filters: CategoriesReportFilters,
  ): Promise<CategoryReportData[]> {
    const { userId, startDate, endDate, type, categoryId } = filters

    // Construir condições WHERE
    const whereConditions: Prisma.EntryWhereInput = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (type) {
      whereConditions.type = type
    }

    if (categoryId && categoryId !== 'all') {
      // Se uma categoria específica foi selecionada, incluir ela e suas subcategorias
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        include: { children: true },
      })

      if (category) {
        const categoryIds = [categoryId]
        if (category.children) {
          categoryIds.push(...category.children.map((child) => child.id))
        }
        whereConditions.categoryId = {
          in: categoryIds,
        }
      }
    }

    // Query agregada para obter dados por categoria
    const result = await this.prisma.entry.groupBy({
      by: ['categoryId'],
      where: whereConditions,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    })

    // Buscar informações das categorias
    const categoryIds = result
      .map((item) => item.categoryId)
      .filter(Boolean) as string[]
    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
        parentId: true,
      },
    })

    // Mapear resultados
    return result.map((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId)
      return {
        categoryId: item.categoryId || '',
        categoryName: category?.name || 'Sem categoria',
        categoryColor: category?.color || '#6b7280',
        categoryIcon: category?.icon || 'folder',
        parentId: category?.parentId || null,
        amount: Number(item._sum.amount) || 0,
        transactionCount: item._count.id || 0,
      }
    })
  }

  // Método para calcular totais de receita e despesa no período
  async getCategoriesReportTotals(
    filters: CategoriesReportFilters,
  ): Promise<{ totalIncome: number; totalExpense: number }> {
    console.log('getCategoriesReportTotals chamado com filtros:', filters)
    const { userId, startDate, endDate } = filters

    const whereConditions: Prisma.EntryWhereInput = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    }

    // Calcular total de receitas
    const incomeResult = await this.prisma.entry.aggregate({
      where: {
        ...whereConditions,
        type: 'income',
      },
      _sum: {
        amount: true,
      },
    })

    // Calcular total de despesas
    const expenseResult = await this.prisma.entry.aggregate({
      where: {
        ...whereConditions,
        type: 'expense',
      },
      _sum: {
        amount: true,
      },
    })

    return {
      totalIncome: Number(incomeResult._sum.amount) || 0,
      totalExpense: Number(expenseResult._sum.amount) || 0,
    }
  }

  async getCashflowReport(
    filters: CashflowReportFilters,
  ): Promise<CashflowReportData[]> {
    const { userId, startDate, endDate, viewMode } = filters

    // Buscar todas as entradas no período
    const entries = await this.prisma.entry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        amount: true,
        type: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Agrupar dados por período
    const dataMap = new Map<string, CashflowReportData>()

    entries.forEach((entry) => {
      const entryDate = new Date(entry.date)
      let key: string
      let periodLabel: string

      switch (viewMode) {
        case 'daily':
          key = entryDate.toISOString().split('T')[0]
          periodLabel = entryDate.toLocaleDateString('pt-BR')
          break
        case 'weekly': {
          const weekStart = new Date(entryDate)
          weekStart.setDate(entryDate.getDate() - entryDate.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          key = weekStart.toISOString().split('T')[0]
          periodLabel = `Semana de ${weekStart.toLocaleDateString('pt-BR')}`
          break
        }
        case 'monthly':
          key = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`
          periodLabel = entryDate.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
          })
          break
        default:
          key = entryDate.toISOString().split('T')[0]
          periodLabel = entryDate.toLocaleDateString('pt-BR')
      }

      const existing = dataMap.get(key)
      const amount = Number(entry.amount)
      if (existing) {
        if (entry.type === 'income') {
          existing.income += amount
          existing.balance += amount
        } else {
          existing.expense += amount
          existing.balance -= amount
        }
      } else {
        dataMap.set(key, {
          date: key,
          income: entry.type === 'income' ? amount : 0,
          expense: entry.type === 'expense' ? amount : 0,
          balance: entry.type === 'income' ? amount : -amount,
          period: periodLabel,
        })
      }
    })

    return Array.from(dataMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    )
  }

  async getAccountsReport(
    filters: AccountsReportFilters,
  ): Promise<AccountReportData[]> {
    const { userId, startDate, endDate, accountFilter } = filters

    // Construir condições WHERE baseadas no filtro de conta
    const whereConditions: Prisma.EntryWhereInput = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    }

    // Aplicar filtro por tipo de conta
    if (accountFilter === 'bank_accounts') {
      whereConditions.accountId = { not: null }
      whereConditions.creditCardId = null
    } else if (accountFilter === 'credit_cards') {
      whereConditions.creditCardId = { not: null }
      whereConditions.accountId = null
    }

    // Query agregada por conta bancária
    const accountEntries = await this.prisma.entry.groupBy({
      by: ['accountId'],
      where: {
        ...whereConditions,
        accountId: { not: null },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    })

    // Query agregada por cartão de crédito
    const creditCardEntries = await this.prisma.entry.groupBy({
      by: ['creditCardId'],
      where: {
        ...whereConditions,
        creditCardId: { not: null },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    })

    const results: AccountReportData[] = []

    // Processar contas bancárias
    if (accountFilter === 'all' || accountFilter === 'bank_accounts') {
      const accountIds = accountEntries
        .map((item) => item.accountId)
        .filter(Boolean) as string[]
      const accounts = await this.prisma.account.findMany({
        where: {
          id: { in: accountIds },
        },
        select: {
          id: true,
          name: true,
          type: true,
          icon: true,
        },
      })

      for (const accountEntry of accountEntries) {
        if (!accountEntry.accountId) continue

        const account = accounts.find(
          (acc) => acc.id === accountEntry.accountId,
        )
        if (!account) continue

        // Calcular receitas e despesas separadamente
        const incomeEntries = await this.prisma.entry.aggregate({
          where: {
            ...whereConditions,
            accountId: accountEntry.accountId,
            type: 'income',
          },
          _sum: {
            amount: true,
          },
        })

        const expenseEntries = await this.prisma.entry.aggregate({
          where: {
            ...whereConditions,
            accountId: accountEntry.accountId,
            type: 'expense',
          },
          _sum: {
            amount: true,
          },
        })

        const totalIncome = Number(incomeEntries._sum.amount) || 0
        const totalExpense = Number(expenseEntries._sum.amount) || 0

        results.push({
          accountId: account.id,
          accountName: account.name,
          accountType: account.type,
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          transactionCount: accountEntry._count.id || 0,
          icon: account.icon || 'wallet',
          iconType: 'bank',
        })
      }
    }

    // Processar cartões de crédito
    if (accountFilter === 'all' || accountFilter === 'credit_cards') {
      const creditCardIds = creditCardEntries
        .map((item) => item.creditCardId)
        .filter(Boolean) as string[]
      const creditCards = await this.prisma.creditCard.findMany({
        where: {
          id: { in: creditCardIds },
        },
        select: {
          id: true,
          name: true,
          icon: true,
        },
      })

      for (const creditCardEntry of creditCardEntries) {
        if (!creditCardEntry.creditCardId) continue

        const creditCard = creditCards.find(
          (cc) => cc.id === creditCardEntry.creditCardId,
        )
        if (!creditCard) continue

        // Calcular receitas e despesas separadamente
        const incomeEntries = await this.prisma.entry.aggregate({
          where: {
            ...whereConditions,
            creditCardId: creditCardEntry.creditCardId,
            type: 'income',
          },
          _sum: {
            amount: true,
          },
        })

        const expenseEntries = await this.prisma.entry.aggregate({
          where: {
            ...whereConditions,
            creditCardId: creditCardEntry.creditCardId,
            type: 'expense',
          },
          _sum: {
            amount: true,
          },
        })

        const totalIncome = Number(incomeEntries._sum.amount) || 0
        const totalExpense = Number(expenseEntries._sum.amount) || 0

        results.push({
          accountId: creditCard.id,
          accountName: creditCard.name,
          accountType: 'credit_card',
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          transactionCount: creditCardEntry._count.id || 0,
          icon: creditCard.icon || 'credit-card',
          iconType: 'generic',
        })
      }
    }

    return results
  }
}
