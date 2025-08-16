import { AccountType, Prisma, PrismaClient } from '@prisma/client'

import { BaseRepository } from '@/repositories/base.repository'

export class AccountRepository extends BaseRepository<'account'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'account')
  }

  // Métodos específicos de negócio
  async findByUserId(userId: string, includeEntries = false) {
    const include: any = {
      _count: {
        select: {
          entries: true,
        },
      },
    }

    if (includeEntries) {
      include.entries = true
    }

    return this.prisma.account.findMany({
      where: { userId },
      include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByUserIdAndType(
    userId: string,
    type: string,
    includeInGeneralBalance?: boolean,
  ) {
    const where: Prisma.AccountWhereInput = {
      userId,
      type: type as AccountType,
    }

    if (includeInGeneralBalance !== undefined) {
      where.includeInGeneralBalance = includeInGeneralBalance
    }

    return this.prisma.account.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async existsByNameAndUserId(
    name: string,
    userId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: Prisma.AccountWhereInput = {
      name,
      userId,
    }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const count = await this.prisma.account.count({ where })
    return count > 0
  }

  async getAccountsWithBalance(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      include: {
        entries: {
          where: { paid: true },
          select: {
            amount: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getAccountBalance(accountId: string, userId: string) {
    const entries = await this.prisma.entry.findMany({
      where: {
        accountId,
        userId,
        paid: true,
      },
      select: {
        amount: true,
        type: true,
      },
    })

    return entries.reduce((acc, entry) => {
      const amount = Number(entry.amount)
      return entry.type === 'income' ? acc + amount : acc - amount
    }, 0)
  }

  async getAccountsSummary(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      icon: account.icon,
      iconType: account.iconType,
      includeInGeneralBalance: account.includeInGeneralBalance,
      entriesCount: account._count.entries,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }))
  }
}
