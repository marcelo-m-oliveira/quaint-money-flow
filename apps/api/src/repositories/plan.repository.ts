import { PrismaClient } from '@prisma/client'

import { BaseRepository } from './base.repository'

export class PlanRepository extends BaseRepository<'plan'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'plan')
  }

  async findActivePlans() {
    return this.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { price: 'asc' }],
    })
  }

  async findWithUserCount() {
    return this.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    })
  }

  async findByName(name: string) {
    return this.findFirst({ name })
  }

  async findByNameExcludingId(name: string, excludeId: string) {
    return this.findFirst({
      name,
      id: { not: excludeId },
    })
  }

  async countUsersByPlan(planId: string) {
    return this.prisma.user.count({
      where: { planId },
    })
  }
}
