import { PrismaClient } from '@prisma/client'

export class OverviewRepository {
  constructor(private prisma: PrismaClient) {}

  // Buscar resumo geral do mês atual
  async getMonthlyOverview(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    // Receitas e despesas do mês atual (apenas lançamentos pagos)
    const monthlyEntries = await this.prisma.entry.groupBy({
      by: ['type'],
      where: {
        userId,
        paid: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Contas a pagar (todas as pendentes, independentemente da data)
    const accountsPayable = await this.prisma.entry.findMany({
      where: {
        userId,
        type: 'expense',
        paid: false,
      },
      select: {
        id: true,
        description: true,
        amount: true,
        date: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Contas a receber (todas as pendentes, independentemente da data)
    const accountsReceivable = await this.prisma.entry.findMany({
      where: {
        userId,
        type: 'income',
        paid: false,
      },
      select: {
        id: true,
        description: true,
        amount: true,
        date: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return {
      monthlyEntries,
      accountsPayable,
      accountsReceivable,
    }
  }

  // Buscar maiores gastos por categoria pai em um período
  async getTopExpensesByCategory(
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const expenses = await this.prisma.entry.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'expense',
        paid: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    })

    // Buscar informações das categorias
    const categoryIds = expenses.map((expense) => expense.categoryId)
    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        parentId: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Agrupar por categoria pai
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]))
    const parentCategoryTotals = new Map<
      string,
      { id: string; name: string; total: number; icon: string; color: string }
    >()

    expenses.forEach((expense) => {
      const category = categoryMap.get(expense.categoryId)
      if (!category) return

      const parentCategory = category.parent || category
      const parentId = parentCategory.id
      const parentName = parentCategory.name
      const amount = Number(expense._sum.amount || 0)

      if (parentCategoryTotals.has(parentId)) {
        const existing = parentCategoryTotals.get(parentId)!
        existing.total += amount
      } else {
        parentCategoryTotals.set(parentId, {
          id: category.id,
          name: parentName,
          total: amount,
          icon: category.icon,
          color: category.color,
        })
      }
    })

    // Converter para array e ordenar por valor
    return Array.from(parentCategoryTotals.values())
      .sort((a, b) => b.total - a.total)
      .map((item) => ({
        id: item.id,
        categoryName: item.name,
        totalAmount: item.total,
        icon: item.icon,
        color: item.color,
      }))
  }

  // Método auxiliar para calcular datas baseadas no período
  getDateRangeForPeriod(period: string): { startDate: Date; endDate: Date } {
    const now = new Date()
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    )
    let startDate: Date

    switch (period) {
      case 'last-15-days':
        startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
        break
      case 'last-30-days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'last-3-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case 'last-6-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        break
      case 'current-month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    return { startDate, endDate }
  }
}
