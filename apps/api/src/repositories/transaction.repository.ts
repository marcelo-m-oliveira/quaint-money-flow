import { Prisma, PrismaClient } from '@prisma/client'

import { BaseRepository } from './base.repository'

export class TransactionRepository extends BaseRepository<'transaction'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'transaction')
  }

  // Métodos específicos de negócio
  async findByUserId(
    userId: string,
    options?: {
      includeCategory?: boolean
      includeAccount?: boolean
      includeCreditCard?: boolean
      startDate?: Date
      endDate?: Date
      type?: 'income' | 'expense'
    },
  ) {
    const where: Prisma.TransactionWhereInput = { userId }

    if (options?.startDate && options?.endDate) {
      where.date = {
        gte: options.startDate,
        lte: options.endDate,
      }
    }

    if (options?.type) {
      where.type = options.type
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        category: options?.includeCategory,
        account: options?.includeAccount,
        creditCard: options?.includeCreditCard,
      },
      orderBy: { date: 'desc' },
    })
  }

  async findByAccountId(accountId: string, userId: string) {
    return this.prisma.transaction.findMany({
      where: { accountId, userId },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    })
  }

  async findByCreditCardId(creditCardId: string, userId: string) {
    return this.prisma.transaction.findMany({
      where: { creditCardId, userId },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    })
  }

  async findByCategoryId(categoryId: string, userId: string) {
    return this.prisma.transaction.findMany({
      where: { categoryId, userId },
      include: {
        account: true,
        creditCard: true,
      },
      orderBy: { date: 'desc' },
    })
  }

  async countByUserId(userId: string) {
    return this.prisma.transaction.count({
      where: { userId },
    })
  }

  async countByAccountId(accountId: string, userId: string) {
    return this.prisma.transaction.count({
      where: { accountId, userId },
    })
  }

  async countByCreditCardId(creditCardId: string, userId: string) {
    return this.prisma.transaction.count({
      where: { creditCardId, userId },
    })
  }

  async getSummaryByUserId(userId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.TransactionWhereInput = { userId }

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const [incomeSum, expenseSum, totalCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'income' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'expense' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where }),
    ])

    const totalIncome = Number(incomeSum._sum.amount) || 0
    const totalExpense = Number(expenseSum._sum.amount) || 0
    const balance = totalIncome - totalExpense

    return {
      totalIncome,
      totalExpense,
      balance,
      totalCount,
    }
  }
}
