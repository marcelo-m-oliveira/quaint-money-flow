import { FastifyInstance } from 'fastify'
import { CouponFactory } from '@/factories/coupon.factory'
import { Actions } from '@/lib/casl'
import { authMiddleware } from '@/middleware/auth.middleware'
import { 
  loadUserAbilities, 
  requirePermission 
} from '@/middleware/authorization.middleware'

export async function couponsRoutes(fastify: FastifyInstance) {
  const couponController = CouponFactory.getCouponController()

  // Rotas administrativas (apenas admins podem gerenciar cupons)
  fastify.get('/', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.READ, 'Coupon'),
    ],
    handler: couponController.index.bind(couponController),
  })

  fastify.get('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.READ, 'Coupon'),
    ],
    handler: couponController.show.bind(couponController),
  })

  fastify.post('/', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.CREATE, 'Coupon'),
    ],
    handler: couponController.store.bind(couponController),
  })

  fastify.put('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.UPDATE, 'Coupon'),
    ],
    handler: couponController.update.bind(couponController),
  })

  fastify.delete('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.DELETE, 'Coupon'),
    ],
    handler: couponController.destroy.bind(couponController),
  })

  // Rota para validar cupom (usuários podem validar cupons)
  fastify.post('/validate', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
    ],
    handler: couponController.validate.bind(couponController),
  })

  // Rota para usar cupom (usuários podem usar cupons)
  fastify.post('/:id/use', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
    ],
    handler: couponController.use.bind(couponController),
  })

  // Estatísticas (apenas admins)
  fastify.get('/admin/stats', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.READ, 'Coupon'),
    ],
    handler: couponController.stats.bind(couponController),
  })
}
