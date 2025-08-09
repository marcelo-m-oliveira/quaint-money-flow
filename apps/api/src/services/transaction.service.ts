/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, Transaction } from '@prisma/client'

import { TransactionRepository } from '@/repositories/transaction.repository'

import { BadRequestError } from '../http/routes/_errors/bad-request-error'

export class TransactionService {
  private transactionRepository: TransactionRepository
  private prisma: PrismaClient

  constructor(
    transactionRepository?: TransactionRepository,
    prisma?: PrismaClient,
  ) {
    this.prisma = prisma || new PrismaClient()
    this.transactionRepository =
      transactionRepository || new TransactionRepository(this.prisma)
  }

  async findById(id: string, userId: string) {
    const transaction = await this.transactionRepository.findById(id)

    if (!transaction || transaction.userId !== userId) {
      throw new BadRequestError('Transação não encontrada')
    }

    return transaction
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 10,
    filters?: {
      type?: 'income' | 'expense'
      categoryId?: string
      accountId?: string
      creditCardId?: string
      startDate?: Date
      endDate?: Date
      search?: string
    },
  ) {
    const skip = (page - 1) * limit

    const where: Partial<Transaction> = { userId }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId
    }

    if (filters?.accountId) {
      where.accountId = filters.accountId
    }

    if (filters?.creditCardId) {
      where.creditCardId = filters.creditCardId
    }

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      } as any
    }

    if (filters?.search) {
      where.description = {
        contains: filters.search,
        mode: 'insensitive',
      } as any
    }

    const [transactions, total] = await Promise.all([
      this.transactionRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          category: true,
          account: true,
          creditCard: true,
        },
      }),
      this.transactionRepository.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  async create(data: any, userId: string) {
    return this.transactionRepository.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    })
  }

  async update(id: string, data: any, userId: string) {
    // Verificar se a transação existe
    await this.findById(id, userId)

    return this.transactionRepository.update(id, data)
  }

  async delete(id: string, userId: string) {
    // Verificar se a transação existe
    await this.findById(id, userId)

    return this.transactionRepository.delete(id)
  }

  async deleteAllByUserId(userId: string) {
    // Excluir todas as transações do usuário
    const result = await this.transactionRepository.deleteMany({
      where: { userId },
    })

    return {
      deletedCount: result.count,
      message: `${result.count} transações foram excluídas`,
    }
  }

  async deleteAllUserData(userId: string) {
    // Excluir todos os dados do usuário em ordem (devido às foreign keys)
    const results = await this.prisma.$transaction(async (prisma) => {
      // 1. Excluir transações
      const transactionsResult = await prisma.transaction.deleteMany({
        where: { userId },
      })

      // 2. Excluir categorias
      const categoriesResult = await prisma.category.deleteMany({
        where: { userId },
      })

      // 3. Excluir contas
      const accountsResult = await prisma.account.deleteMany({
        where: { userId },
      })

      // 4. Excluir cartões de crédito
      const creditCardsResult = await prisma.creditCard.deleteMany({
        where: { userId },
      })

      // 5. Excluir preferências do usuário
      const preferencesResult = await prisma.userPreferences.deleteMany({
        where: { userId },
      })

      // 6. Excluir o próprio usuário
      const userResult = await prisma.user.delete({
        where: { id: userId },
      })

      return {
        transactions: transactionsResult.count,
        categories: categoriesResult.count,
        accounts: accountsResult.count,
        creditCards: creditCardsResult.count,
        preferences: preferencesResult.count,
        user: userResult ? 1 : 0,
      }
    })

    return {
      deletedCounts: results,
      message: 'Conta excluída completamente com sucesso',
    }
  }
}
