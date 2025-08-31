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
    .union([z.string().datetime(), z.number()])
    .optional()
    .transform((val) => {
      if (!val) return undefined
      if (typeof val === 'number') {
        // Se for timestamp em segundos, converte para Date
        return new Date(val * 1000)
      }
      // Se for string datetime, converte diretamente
      return new Date(val)
    }),
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
    try {
      const query = CouponQuerySchema.parse(request.query)

      request.log.info(
        {
          includeInactive: query.includeInactive,
          includeUsage: query.includeUsage,
          query: request.query,
        },
        'Listando cupons com filtros',
      )

      const coupons = await this.couponService.findMany({
        includeInactive: query.includeInactive,
        includeUsage: query.includeUsage,
      })

      request.log.info(
        {
          totalCoupons: coupons.length,
          activeCoupons: coupons.filter((c) => c.isActive).length,
          inactiveCoupons: coupons.filter((c) => !c.isActive).length,
        },
        'Cupons encontrados',
      )

      const couponsWithConvertedDates = coupons.map((coupon: any) =>
        convertDatesToSeconds(coupon, ['createdAt', 'updatedAt', 'expiresAt']),
      )

      return reply.status(200).send({
        coupons: couponsWithConvertedDates,
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'index' },
        `Erro na listagem de ${this.entityNamePlural}`,
      )
      throw error
    }
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const coupon = await this.couponService.findById(id)

      return reply
        .status(200)
        .send(
          convertDatesToSeconds(coupon, [
            'createdAt',
            'updatedAt',
            'expiresAt',
          ]),
        )
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'show' },
        `Erro na busca de ${this.entityName}`,
      )
      throw error
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = CouponCreateSchema.parse(request.body)
      const coupon = await this.couponService.create(data)
      return reply
        .status(201)
        .send(
          convertDatesToSeconds(coupon, [
            'createdAt',
            'updatedAt',
            'expiresAt',
          ]),
        )
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'store' },
        `Erro na criação de ${this.entityName}`,
      )
      throw error
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const data = CouponUpdateSchema.parse(request.body)
      const coupon = await this.couponService.update(id, data)
      return reply
        .status(200)
        .send(
          convertDatesToSeconds(coupon, [
            'createdAt',
            'updatedAt',
            'expiresAt',
          ]),
        )
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'update' },
        `Erro na atualização de ${this.entityName}`,
      )
      throw error
    }
  }

  async destroy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      await this.couponService.delete(id)
      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'destroy' },
        `Erro na exclusão de ${this.entityName}`,
      )
      throw error
    }
  }

  async validate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const { code } = ValidateCouponSchema.parse(request.body)

      const validation = await this.couponService.validateCoupon(code, userId)

      if (!validation.valid) {
        return reply.status(200).send({
          valid: false,
          error: validation.error,
        })
      }

      return reply.status(200).send({
        valid: true,
        coupon: validation.coupon
          ? convertDatesToSeconds(validation.coupon, [
              'createdAt',
              'updatedAt',
              'expiresAt',
            ])
          : null,
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'validate' },
        'Erro na validação de cupom',
      )
      throw error
    }
  }

  async use(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserId(request)
      const { id } = this.getPathParams<{ id: string }>(request)

      // Validar cupom antes de usar
      const coupon = await this.couponService.findById(id)

      const validation = await this.couponService.validateCoupon(
        coupon.code,
        userId,
      )
      if (!validation.valid) {
        throw new Error(validation.error || 'Cupom inválido')
      }

      await this.couponService.useCoupon(id, userId)

      return reply.status(200).send({
        success: true,
        message: 'Cupom utilizado com sucesso',
      })
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'use' },
        'Erro no uso de cupom',
      )
      throw error
    }
  }

  async stats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await this.couponService.getCouponStats()
      return reply.status(200).send(stats)
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'stats' },
        'Erro ao buscar estatísticas de cupons',
      )
      throw error
    }
  }

  async activate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const coupon = await this.couponService.activate(id)
      return reply.status(200).send(convertDatesToSeconds(coupon))
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'activate' },
        `Erro na ativação de ${this.entityName}`,
      )
      throw error
    }
  }

  async deactivate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = this.getPathParams<{ id: string }>(request)
      const coupon = await this.couponService.deactivate(id)
      return reply.status(200).send(convertDatesToSeconds(coupon))
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: 'deactivate' },
        `Erro na desativação de ${this.entityName}`,
      )
      throw error
    }
  }
}
