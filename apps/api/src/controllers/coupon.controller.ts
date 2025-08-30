import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { CouponService } from '@/services/coupon.service'
import { convertDatesToSeconds } from '@/utils/response'

import { BaseController } from './base.controller'

// Schemas de validação
const CouponCreateSchema = z.object({
  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código deve ter no máximo 20 caracteres'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive('Valor do desconto deve ser positivo'),
  maxUses: z.number().positive().optional(),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  isActive: z.boolean().optional().default(true),
})

const CouponUpdateSchema = CouponCreateSchema.partial()

const CouponQuerySchema = z.object({
  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  includeUsage: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
})

const ValidateCouponSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
})

interface CouponFilters {
  includeInactive?: boolean
  includeUsage?: boolean
}

export class CouponController extends BaseController {
  constructor(private couponService: CouponService) {
    super({ entityName: 'Cupom', entityNamePlural: 'Cupons' })
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    return this.handleRequest(
      request,
      reply,
      async () => {
        const query = CouponQuerySchema.parse(request.query)
        const coupons = await this.couponService.getAll({
          includeInactive: query.includeInactive,
          includeUsage: query.includeUsage,
        })

        return {
          coupons: coupons.map((coupon) => convertDatesToSeconds(coupon)),
        }
      },
      `Listagem de ${this.entityNamePlural}`,
    )
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    return this.handleShowRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        const coupon = await this.couponService.getById(id)

        if (!coupon) {
          throw new Error(`${this.entityName} não encontrado`)
        }

        return convertDatesToSeconds(coupon)
      },
      `Busca de ${this.entityName}`,
    )
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    return this.handleCreateRequest(
      request,
      reply,
      async () => {
        const data = CouponCreateSchema.parse(request.body)
        const coupon = await this.couponService.create(data)
        return convertDatesToSeconds(coupon)
      },
      `Criação de ${this.entityName}`,
    )
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    return this.handleUpdateRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        const data = CouponUpdateSchema.parse(request.body)
        const coupon = await this.couponService.update(id, data)
        return convertDatesToSeconds(coupon)
      },
      `Atualização de ${this.entityName}`,
    )
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    return this.handleDeleteRequest(
      request,
      reply,
      async () => {
        const { id } = this.getPathParams<{ id: string }>(request)
        await this.couponService.delete(id)
        return { deleted: true }
      },
      `Exclusão de ${this.entityName}`,
    )
  }

  async validate(request: FastifyRequest, reply: FastifyReply) {
    return this.handleShowRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const { code } = ValidateCouponSchema.parse(request.body)

        const validation = await this.couponService.validateCoupon(code, userId)

        if (!validation.valid) {
          return {
            valid: false,
            error: validation.error,
          }
        }

        return {
          valid: true,
          coupon: validation.coupon
            ? convertDatesToSeconds(validation.coupon)
            : null,
        }
      },
      'Validação de Cupom',
    )
  }

  async use(request: FastifyRequest, reply: FastifyReply) {
    return this.handleCreateRequest(
      request,
      reply,
      async () => {
        const userId = this.getUserId(request)
        const { id } = this.getPathParams<{ id: string }>(request)

        // Validar cupom antes de usar
        const coupon = await this.couponService.getById(id)
        if (!coupon) {
          throw new Error('Cupom não encontrado')
        }

        const validation = await this.couponService.validateCoupon(
          coupon.code,
          userId,
        )
        if (!validation.valid) {
          throw new Error(validation.error || 'Cupom inválido')
        }

        await this.couponService.useCoupon(id, userId)

        return {
          success: true,
          message: 'Cupom utilizado com sucesso',
        }
      },
      'Uso de Cupom',
    )
  }

  async stats(request: FastifyRequest, reply: FastifyReply) {
    return this.handleRequest(
      request,
      reply,
      async () => {
        const stats = await this.couponService.getCouponStats()
        return stats
      },
      'Estatísticas de Cupons',
    )
  }
}
