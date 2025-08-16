import { Account, AccountType, PrismaClient } from '@prisma/client'

import { AccountRepository } from '@/repositories/account.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { type AccountCreateSchema } from '@/utils/schemas'

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

    // Buscar contas com transações para calcular o balance
    const accountsWithEntries =
      await this.accountRepository.getAccountsWithBalance(userId)

    // Filtrar e paginar as contas
    const filteredAccounts = accountsWithEntries.filter((account) => {
      if (type && account.type !== type) return false
      return !(
        includeInGeneralBalance !== undefined &&
        account.includeInGeneralBalance !== includeInGeneralBalance
      )
    })

    // Ordenar por data de criação (mais recentes primeiro)
    filteredAccounts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    const total = filteredAccounts.length
    const totalPages = Math.ceil(total / limit)

    // Aplicar paginação
    const paginatedAccounts = filteredAccounts.slice(skip, skip + limit)

    // Calcular o balance para cada conta
    const accountsWithBalance = paginatedAccounts.map((account) => {
      const balance = account.entries.reduce((acc, entriy) => {
        const amount = Number(entriy.amount)
        return entriy.type === 'income' ? acc + amount : acc - amount
      }, 0)

      // Remover as transações do retorno e adicionar o balance
      const { ...accountData } = account
      return {
        ...accountData,
        balance,
      }
    })

    return {
      accounts: accountsWithBalance,
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

  async create(data: AccountCreateSchema, userId: string) {
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

  async update(id: string, data: Partial<AccountCreateSchema>, userId: string) {
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
    const entryCount = await this.prisma.entry.count({
      where: { accountId: id, userId },
    })

    if (entryCount > 0) {
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
    const entries = await this.prisma.entry.findMany({
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

    const balance = entries.reduce((acc, entriy) => {
      const amount = Number(entriy.amount)
      return entriy.type === 'income' ? acc + amount : acc - amount
    }, 0)

    return {
      balance,
      accountId: id,
      lastUpdated: new Date().toISOString(),
    }
  }
}
