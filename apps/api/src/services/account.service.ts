import { Account, AccountType, PrismaClient } from '@prisma/client'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { AccountRepository } from '@/repositories/account.repository'

import type { AccountFormSchema } from '../utils/schemas'

export class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private prisma: PrismaClient,
  ) {}

  async findMany(
    userId: string,
    filters: {
      type?: string
      includeInGeneralBalance?: boolean
      page: number
      limit: number
    },
  ) {
    const { page, limit, type, includeInGeneralBalance } = filters
    const skip = (page - 1) * limit

    const where: Partial<Account> = {
      userId,
    }

    if (type) {
      where.type = type as AccountType
    }

    if (includeInGeneralBalance !== undefined) {
      where.includeInGeneralBalance = includeInGeneralBalance
    }

    const [accounts, total] = await Promise.all([
      this.accountRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.accountRepository.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      accounts,
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

  async findById(id: string, userId: string) {
    const account = await this.accountRepository.findUnique({
      where: { id, userId },
    })

    if (!account) {
      throw new BadRequestError('Conta não encontrada')
    }

    return account
  }

  async create(data: AccountFormSchema, userId: string) {
    // Verificar se já existe uma conta com o mesmo nome
    const existingAccount = await this.accountRepository.findFirst({
      where: {
        name: data.name,
        userId,
      },
    })

    if (existingAccount) {
      throw new BadRequestError('Já existe uma conta com este nome')
    }

    return this.accountRepository.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    })
  }

  async update(id: string, data: AccountFormSchema, userId: string) {
    // Verificar se a conta existe
    await this.findById(id, userId)

    // Verificar se já existe outra conta com o mesmo nome
    const existingAccount = await this.accountRepository.findFirst({
      where: {
        name: data.name,
        userId,
        NOT: { id },
      },
    })

    if (existingAccount) {
      throw new BadRequestError('Já existe uma conta com este nome')
    }

    return this.accountRepository.update({
      where: { id, userId },
      data,
    })
  }

  async delete(id: string, userId: string) {
    // Verificar se a conta existe
    await this.findById(id, userId)

    // Verificar se há transações associadas
    const transactionCount = await this.prisma.transaction.count({
      where: { accountId: id, userId },
    })

    if (transactionCount > 0) {
      throw new BadRequestError(
        'Não é possível excluir uma conta que possui transações',
      )
    }

    return this.accountRepository.delete({
      where: { id, userId },
    })
  }

  async getBalance(id: string, userId: string) {
    // Verificar se a conta existe
    await this.findById(id, userId)

    // Calcular saldo baseado nas transações pagas
    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId: id,
        userId,
        paid: true,
      },
      select: {
        amount: true,
        type: true,
      },
    })

    const balance = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount)
      return transaction.type === 'income' ? acc + amount : acc - amount
    }, 0)

    return {
      balance,
      accountId: id,
      lastUpdated: new Date().toISOString(),
    }
  }
}
