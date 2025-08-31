import { FastifyInstance } from 'fastify'

import { CouponFactory } from '@/factories/coupon.factory'
import { Actions } from '@/lib/casl'
import { authMiddleware } from '@/middleware/auth.middleware'
import {
  loadUserAbilities,
  requirePermission,
} from '@/middleware/authorization.middleware'

export async function adminCouponsRoutes(fastify: FastifyInstance) {
  const couponController = CouponFactory.getCouponController()

  // Listar cupons
  fastify.get('/', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Coupon'),
    ],
    handler: couponController.index.bind(couponController),
  })

  // Buscar cupom específico
  fastify.get('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Coupon'),
    ],
    handler: couponController.show.bind(couponController),
  })

  // Criar novo cupom
  fastify.post('/', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Coupon'),
    ],
    handler: couponController.store.bind(couponController),
  })

  // Atualizar cupom
  fastify.put('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Coupon'),
    ],
    handler: couponController.update.bind(couponController),
  })

  // Excluir cupom
  fastify.delete('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Coupon'),
    ],
    handler: couponController.destroy.bind(couponController),
  })

  // Ativar cupom
  fastify.patch('/:id/activate', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Coupon'),
    ],
    handler: couponController.activate.bind(couponController),
  })

  // Desativar cupom
  fastify.patch('/:id/deactivate', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Coupon'),
    ],
    handler: couponController.deactivate.bind(couponController),
  })
}
