import { Account, AccountType, PrismaClient } from '@prisma/client'
import { BaseService, PaginatedData } from './base.service'
import { AccountRepository } from '@/repositories/account.repository'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { type AccountCreateSchema } from '@/utils/schemas'

interface AccountFilters {
  type?: string
  includeInGeneralBalance?: boolean
  page: number
  limit: number
}

export class AccountServiceRefactored extends BaseService<'account'> {
  constructor(
    accountRepository: AccountRepository,
    prisma: PrismaClient,
  ) {
    super(accountRepository, prisma)
  }

  async findMany(userId: string, filters: AccountFilters): Promise<PaginatedData<Account & { balance: number }>> {
    const { page, limit, type, includeInGeneralBalance } = filters

    // Construir where clause
    const where: Partial<Account> = { userId }

    if (type) {
      where.type = type as AccountType
    }

    if (includeInGeneralBalance !== undefined) {
      where.includeInGeneralBalance = includeInGeneralBalance
    }

    // Buscar contas com transações para calcular o balance
    const accountsWithEntries = await (this.repository as AccountRepository).getAccountsWithBalance(userId)

    // Filtrar as contas
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
    const skip = (page - 1) * limit

    // Aplicar paginação
    const paginatedAccounts = filteredAccounts.slice(skip, skip + limit)

    // Calcular o balance para cada conta
    const accountsWithBalance = paginatedAccounts.map((account) => {
      const balance = account.entries.reduce((acc, entry) => {
        const amount = Number(entry.amount)
        return entry.type === 'income' ? acc + amount : acc - amount
      }, 0)

      // Remover as transações do retorno e adicionar o balance
      const { entries, ...accountData } = account
      return {
        ...accountData,
        balance,
      }
    })

    return {
      items: accountsWithBalance,
      pagination: this.calculatePagination(total, page, limit),
    }
  }

  async findById(id: string, userId: string): Promise<Account> {
    const account = await this.findByIdOrThrow(id, userId, 'Conta')
    return account
  }

  async create(userId: string, data: AccountCreateSchema): Promise<Account> {
    // Validar campos obrigatórios
    this.validateRequiredFields(data, ['name', 'type', 'icon'], 'Conta')

    // Validar se já existe uma conta com o mesmo nome para o usuário
    await this.validateUniqueConstraint('name', data.name, userId, undefined, 'Conta')

    // Sanitizar dados permitidos
    const sanitizedData = this.sanitizeData(data, [
      'name',
      'type',
      'icon',
      'iconType',
      'includeInGeneralBalance',
    ])

    const account = await this.repository.create({
      ...sanitizedData,
      userId,
    })

    this.logOperation('create', userId, { accountId: account.id, accountName: account.name })
    return account
  }

  async update(id: string, userId: string, data: Partial<AccountCreateSchema>): Promise<Account> {
    // Verificar se a conta existe e pertence ao usuário
    await this.findByIdOrThrow(id, userId, 'Conta')

    // Se o nome foi alterado, validar unicidade
    if (data.name) {
      await this.validateUniqueConstraint('name', data.name, userId, id, 'Conta')
    }

    // Sanitizar dados permitidos
    const sanitizedData = this.sanitizeData(data, [
      'name',
      'type',
      'icon',
      'iconType',
      'includeInGeneralBalance',
    ])

    const account = await this.repository.update(id, sanitizedData)

    this.logOperation('update', userId, { accountId: id, accountName: account.name })
    return account
  }

  async delete(id: string, userId: string): Promise<void> {
    // Verificar se a conta existe e pertence ao usuário
    const account = await this.findByIdOrThrow(id, userId, 'Conta')

    // Verificar se há transações associadas
    const hasEntries = await (this.repository as AccountRepository).hasEntries(id)
    if (hasEntries) {
      throw new BadRequestError('Não é possível excluir uma conta que possui transações')
    }

    await this.repository.delete(id)

    this.logOperation('delete', userId, { accountId: id, accountName: account.name })
  }

  async getBalance(id: string, userId: string): Promise<number> {
    // Verificar se a conta existe e pertence ao usuário
    await this.findByIdOrThrow(id, userId, 'Conta')

    const balance = await (this.repository as AccountRepository).getBalance(id)
    return balance
  }

  async getAccountsWithBalance(userId: string): Promise<(Account & { balance: number })[]> {
    const accountsWithEntries = await (this.repository as AccountRepository).getAccountsWithBalance(userId)

    return accountsWithEntries.map((account) => {
      const balance = account.entries.reduce((acc, entry) => {
        const amount = Number(entry.amount)
        return entry.type === 'income' ? acc + amount : acc - amount
      }, 0)

      const { entries, ...accountData } = account
      return {
        ...accountData,
        balance,
      }
    })
  }
}
