import { PrismaClient, UserRole } from '@prisma/client'

import { BaseRepository } from './base.repository'

export interface UserWithPlan {
  id: string
  email: string
  name: string
  role: UserRole
  planId: string | null
  avatarUrl: string | null
  passwordConfigured: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  plan?: {
    id: string
    name: string
    type: string
    price: number
  } | null
  _count?: {
    accounts: number
    categories: number
    creditCards: number
    entries: number
  }
}

export class UserManagementRepository extends BaseRepository<'user'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user')
  }

  async findWithPlanAndCounts(where: any, skip: number, take: number) {
    return this.findMany({
      where,
      skip,
      take,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
          },
        },
        _count: {
          select: {
            accounts: true,
            categories: true,
            creditCards: true,
            entries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByEmail(email: string) {
    return this.findFirst({ email })
  }

  async findByEmailExcludingId(email: string, excludeId: string) {
    return this.findFirst({
      email,
      id: { not: excludeId },
    })
  }

  async findWithPlan(id: string) {
    return this.findById(id, {
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
          },
        },
        _count: {
          select: {
            accounts: true,
            categories: true,
            creditCards: true,
            entries: true,
          },
        },
      },
    })
  }
}
