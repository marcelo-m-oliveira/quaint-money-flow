import { PrismaClient } from '@prisma/client'

import { BaseRepository } from './base.repository'

export interface CouponWithUsage {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses: number | null
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    userCoupons: number
  }
}

export class CouponRepository extends BaseRepository<'coupon'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'coupon')
  }

  async findWithUsage(where: any) {
    return this.findMany({
      where,
      include: {
        _count: {
          select: {
            userCoupons: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByIdWithUsage(id: string) {
    return this.findById(id, {
      include: {
        _count: {
          select: {
            userCoupons: true,
          },
        },
      },
    })
  }

  async findByCode(code: string) {
    return this.findFirst({ code })
  }

  async findByCodeExcludingId(code: string, excludeId: string) {
    return this.findFirst({
      code,
      id: { not: excludeId },
    })
  }

  async findActiveCoupons() {
    return this.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}
