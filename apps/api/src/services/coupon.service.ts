import { PrismaClient } from '@prisma/client'

import {
  CouponRepository,
  type CouponWithUsage,
} from '@/repositories/coupon.repository'
import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { BaseService } from '@/services/base.service'

export interface CouponCreateData {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses?: number
  expiresAt?: Date
  isActive?: boolean
}

export interface CouponUpdateData extends Partial<CouponCreateData> {}

export class CouponService extends BaseService<'coupon'> {
  constructor(
    private couponRepository: CouponRepository,
    prisma: PrismaClient,
  ) {
    super(couponRepository, prisma)
  }

  async findMany(options?: {
    includeInactive?: boolean
    includeUsage?: boolean
  }): Promise<CouponWithUsage[]> {
    const where = options?.includeInactive ? {} : { isActive: true }

    if (options?.includeUsage) {
      return this.couponRepository.findWithUsage(where)
    }

    return this.couponRepository.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string): Promise<CouponWithUsage> {
    const coupon = await this.couponRepository.findByIdWithUsage(id)

    if (!coupon) {
      throw new BadRequestError('Cupom não encontrado')
    }

    return coupon
  }

  async findByCode(code: string): Promise<CouponWithUsage | null> {
    return this.couponRepository.findByCode(code)
  }

  async create(data: CouponCreateData) {
    // Verificar se o código já existe
    const existingCoupon = await this.couponRepository.findByCode(data.code)

    if (existingCoupon) {
      throw new BadRequestError('Já existe um cupom com este código')
    }

    // Validar dados
    if (data.discountType === 'percentage' && data.discountValue > 100) {
      throw new BadRequestError(
        'Desconto percentual não pode ser maior que 100%',
      )
    }

    if (data.discountValue <= 0) {
      throw new BadRequestError('Valor do desconto deve ser maior que zero')
    }

    const coupon = await this.couponRepository.create({
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt,
      isActive: data.isActive ?? true,
    })

    this.logOperation('CREATE_COUPON', 'admin', {
      couponId: coupon.id,
      couponCode: coupon.code,
    })

    return coupon
  }

  async update(id: string, data: CouponUpdateData) {
    // Verificar se o cupom existe
    await this.findById(id)

    const updateData: any = {}

    if (data.code !== undefined) {
      // Verificar se já existe outro cupom com o mesmo código
      const duplicateCoupon = await this.couponRepository.findByCodeExcludingId(
        data.code,
        id,
      )

      if (duplicateCoupon) {
        throw new BadRequestError('Já existe um cupom com este código')
      }

      updateData.code = data.code.toUpperCase()
    }

    if (data.discountType !== undefined) {
      updateData.discountType = data.discountType
    }

    if (data.discountValue !== undefined) {
      // Validar dados
      if (data.discountType === 'percentage' && data.discountValue > 100) {
        throw new BadRequestError(
          'Desconto percentual não pode ser maior que 100%',
        )
      }

      if (data.discountValue <= 0) {
        throw new BadRequestError('Valor do desconto deve ser maior que zero')
      }

      updateData.discountValue = data.discountValue
    }

    if (data.maxUses !== undefined) {
      updateData.maxUses = data.maxUses
    }

    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
    }

    const coupon = await this.couponRepository.update(id, updateData)

    this.logOperation('UPDATE_COUPON', 'admin', {
      couponId: coupon.id,
      couponCode: coupon.code,
    })

    return coupon
  }

  async delete(id: string) {
    // Verificar se o cupom existe
    const coupon = await this.findById(id)

    // Verificar se há usuários usando este cupom
    const usageCount = coupon._count?.userCoupons || 0

    if (usageCount > 0) {
      throw new BadRequestError(
        'Não é possível excluir um cupom que está sendo usado por usuários',
      )
    }

    await this.couponRepository.delete(id)

    this.logOperation('DELETE_COUPON', 'admin', {
      couponId: id,
      couponCode: coupon.code,
    })

    return coupon
  }

  async deactivate(id: string) {
    return this.update(id, { isActive: false })
  }

  async activate(id: string) {
    return this.update(id, { isActive: true })
  }

  async getCouponStats() {
    const [totalCoupons, activeCoupons, couponUsage] = await Promise.all([
      this.couponRepository.count(),
      this.couponRepository.count({ isActive: true }),
      this.couponRepository.findWithUsage({}),
    ])

    return {
      totalCoupons,
      activeCoupons,
      couponUsage: couponUsage.map((coupon: any) => ({
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        usageCount: coupon._count?.userCoupons || 0,
        isActive: coupon.isActive,
      })),
    }
  }

  async validateCoupon(
    code: string,
    userId: string,
  ): Promise<{
    valid: boolean
    coupon?: CouponWithUsage
    error?: string
  }> {
    const coupon = await this.findByCode(code.toUpperCase())

    if (!coupon) {
      return { valid: false, error: 'Cupom não encontrado' }
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Cupom inativo' }
    }

    // Verificar se expirou
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return { valid: false, error: 'Cupom expirado' }
    }

    // Verificar limite de usos
    if (coupon.maxUses && (coupon._count?.userCoupons || 0) >= coupon.maxUses) {
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
      // Registrar uso pelo usuário
      await tx.userCoupon.create({
        data: {
          userId,
          couponId,
        },
      })
    })
  }
}
