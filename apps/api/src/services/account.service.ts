import { PrismaClient } from '@prisma/client'

import { checkPlanLimits } from '@/lib/casl'
import { AccountRepository } from '@/repositories/account.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { BaseService } from '@/services/base.service'
import {
  type AccountCreateSchema,
  type AccountUpdateSchema,
} from '@/utils/schemas'

export class AccountService extends BaseService<'account'> {
  constructor(
    private accountRepository: AccountRepository,
    prisma: PrismaClient,
  ) {
    super(accountRepository, prisma)
  }

  async findMany(
    userId: string,
    filters: {
      type?: string
      includeInGeneralBalance?: boolean
      search?: string
      page: number
      limit: number
    },
  ) {
    const { page, limit, type, includeInGeneralBalance, search } = filters
    const skip = (page - 1) * limit

    // Buscar contas com balance
    const accountsWithBalance =
      await this.accountRepository.getAccountsWithBalance(userId)

    // Filtrar e paginar as contas
    const filteredAccounts = accountsWithBalance.filter((account) => {
      if (type && account.type !== type) return false
      if (search && !account.name.toLowerCase().includes(search.toLowerCase()))
        return false
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
    const pagination = this.calculatePagination(total, page, limit)

    // Aplicar paginação
    const paginatedAccounts = filteredAccounts.slice(skip, skip + limit)

    // Calcular balance para cada conta
    const accountsWithCalculatedBalance = paginatedAccounts.map((account) => {
      const balance = account.entries.reduce((acc, entry) => {
        const amount = Number(entry.amount)
        return entry.type === 'income' ? acc + amount : acc - amount
      }, 0)

      return {
        ...account,
        balance,
        entries: undefined, // Remover entries do resultado final
      }
    })

    return {
      accounts: accountsWithCalculatedBalance,
      pagination,
    }
  }

  async findById(id: string, userId: string) {
    const account = await this.accountRepository.findById(id)

    if (!account) {
      throw new BadRequestError('Conta nao encontrada')
    }

    // Verificar se a conta pertence ao usuário
    if (account.userId !== userId) {
      throw new BadRequestError('Conta nao pertence ao usuario')
    }

    return account
  }

  async create(data: AccountCreateSchema, userId: string) {
    // Buscar usuário com plano para verificar limites
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    })

    if (!user) {
      throw new BadRequestError('Usuário não encontrado')
    }

    // Verificar limites do plano (apenas para usuários não-admin)
    if (user.role !== 'admin') {
      const currentAccountsCount = await this.prisma.account.count({
        where: { userId },
      })

      if (!checkPlanLimits(user, 'accounts', currentAccountsCount)) {
        const planFeatures = user.plan?.features as any
        const maxAccounts = planFeatures?.accounts?.max || 0
        throw new BadRequestError(
          `Limite de contas atingido. Seu plano permite no máximo ${maxAccounts} conta(s). Faça upgrade para criar mais contas.`,
        )
      }
    }

    // Verificar se já existe uma conta com o mesmo nome
    const existingAccount = await this.accountRepository.findFirst({
      name: data.name,
      userId,
    })

    if (existingAccount) {
      throw new BadRequestError('Já existe uma conta com este nome')
    }

    const account = await this.accountRepository.create({
      ...data,
      user: { connect: { id: userId } },
    })

    this.logOperation('CREATE_ACCOUNT', userId, {
      accountId: account.id,
      accountName: account.name,
    })
    return account
  }

  async update(id: string, data: Partial<AccountUpdateSchema>, userId: string) {
    // Verificar se a conta existe e pertence ao usuário
    await this.findById(id, userId)

    // Verificar se já existe outra conta com o mesmo nome (apenas se o nome foi fornecido)
    if (data.name) {
      const duplicateAccount = await this.accountRepository.findFirst({
        name: data.name,
        userId,
        id: { not: id },
      })

      if (duplicateAccount) {
        throw new BadRequestError('Já existe uma conta com este nome')
      }
    }

    const account = await this.accountRepository.update(id, data)

    this.logOperation('UPDATE_ACCOUNT', userId, {
      accountId: account.id,
      accountName: account.name,
    })
    return account
  }

  async delete(id: string, userId: string) {
    // Verificar se a conta existe e pertence ao usuário
    const account = await this.findById(id, userId)

    // Verificar se há transações associadas
    const entryCount = await this.prisma.entry.count({
      where: { accountId: id, userId },
    })

    if (entryCount > 0) {
      throw new BadRequestError(
        'Não é possível excluir uma conta que possui transações',
      )
    }

    await this.accountRepository.delete(id)

    this.logOperation('DELETE_ACCOUNT', userId, { accountId: id })

    return account
  }

  async getBalance(id: string, userId: string) {
    // Verificar se a conta existe e pertence ao usuário
    await this.findById(id, userId)

    // Usar o método do repository para calcular o balance
    const balance = await this.accountRepository.getAccountBalance(id, userId)

    return {
      balance,
      accountId: id,
      lastUpdated: new Date().toISOString(),
    }
  }
}
