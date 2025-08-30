import { Coupon } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CouponCreateData {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses?: number
  expiresAt?: Date
  isActive?: boolean
}

export interface CouponUpdateData extends Partial<CouponCreateData> {}

export interface CouponWithUsage extends Coupon {
  _count?: {
    userCoupons: number
  }
}

export class CouponService {
  protected prisma = prisma

  protected calculatePagination(
    total: number,
    page: number,
    limit: number,
  ) {
    const totalPages = Math.ceil(total / limit)
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  async getAll(options?: {
    includeInactive?: boolean
    includeUsage?: boolean
  }): Promise<CouponWithUsage[]> {
    const where = options?.includeInactive ? {} : { isActive: true }
    
    return this.prisma.coupon.findMany({
      where,
      include: options?.includeUsage ? {
        _count: {
          select: {
            userCoupons: true,
          },
        },
      } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getById(id: string): Promise<CouponWithUsage | null> {
    return this.prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userCoupons: true,
          },
        },
      },
    })
  }

  async getByCode(code: string): Promise<CouponWithUsage | null> {
    return this.prisma.coupon.findUnique({
      where: { code },
      include: {
        _count: {
          select: {
            userCoupons: true,
          },
        },
      },
    })
  }

  async create(data: CouponCreateData): Promise<Coupon> {
    // Verificar se o código já existe
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code: data.code },
    })

    if (existingCoupon) {
      throw new Error('Já existe um cupom com este código')
    }

    // Validar dados
    if (data.discountType === 'percentage' && data.discountValue > 100) {
      throw new Error('Desconto percentual não pode ser maior que 100%')
    }

    if (data.discountValue <= 0) {
      throw new Error('Valor do desconto deve ser maior que zero')
    }

    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
        isActive: data.isActive ?? true,
      },
    })
  }

  async update(id: string, data: CouponUpdateData): Promise<Coupon> {
    const existingCoupon = await this.getById(id)
    if (!existingCoupon) {
      throw new Error('Cupom não encontrado')
    }

    // Se está alterando o código, verificar se não existe outro com o mesmo código
    if (data.code && data.code !== existingCoupon.code) {
      const codeExists = await this.prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
      })

      if (codeExists) {
        throw new Error('Já existe um cupom com este código')
      }
    }

    // Validar dados
    if (data.discountType === 'percentage' && data.discountValue && data.discountValue > 100) {
      throw new Error('Desconto percentual não pode ser maior que 100%')
    }

    if (data.discountValue && data.discountValue <= 0) {
      throw new Error('Valor do desconto deve ser maior que zero')
    }

    return this.prisma.coupon.update({
      where: { id },
      data: {
        code: data.code?.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
        isActive: data.isActive,
      },
    })
  }

  async delete(id: string): Promise<void> {
    const existingCoupon = await this.getById(id)
    if (!existingCoupon) {
      throw new Error('Cupom não encontrado')
    }

    // Verificar se o cupom foi usado
    const usageCount = existingCoupon._count?.userCoupons || 0
    if (usageCount > 0) {
      throw new Error('Não é possível excluir um cupom que já foi utilizado')
    }

    await this.prisma.coupon.delete({
      where: { id },
    })
  }

  async validateCoupon(code: string, userId: string): Promise<{
    valid: boolean
    coupon?: CouponWithUsage
    error?: string
  }> {
    const coupon = await this.getByCode(code.toUpperCase())

    if (!coupon) {
      return { valid: false, error: 'Cupom não encontrado' }
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Cupom inativo' }
    }

    // Verificar se expirou
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, error: 'Cupom expirado' }
    }

    // Verificar limite de usos
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, error: 'Cupom esgotado' }
    }

    // Verificar se o usuário já usou este cupom
    const userUsage = await this.prisma.userCoupon.findUnique({
      where: {
        userId_couponId: {
          userId,
          couponId: coupon.id,
        },
      },
    })

    if (userUsage) {
      return { valid: false, error: 'Cupom já utilizado por este usuário' }
    }

    return { valid: true, coupon }
  }

  async useCoupon(couponId: string, userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Incrementar contador de usos
      await tx.coupon.update({
        where: { id: couponId },
        data: {
          currentUses: {
            increment: 1,
          },
        },
      })

      // Registrar uso pelo usuário
      await tx.userCoupon.create({
        data: {
          userId,
          couponId,
        },
      })
    })
  }

  async getCouponStats() {
    const [
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      usedCoupons,
    ] = await Promise.all([
      this.prisma.coupon.count(),
      this.prisma.coupon.count({ where: { isActive: true } }),
      this.prisma.coupon.count({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      }),
      this.prisma.userCoupon.count(),
    ])

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsages: usedCoupons,
    }
  }
}
