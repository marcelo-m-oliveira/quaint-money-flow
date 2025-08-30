import { FastifyInstance } from 'fastify'

import { PlanFactory } from '@/factories/plan.factory'
import { Actions } from '@/lib/casl'
import { authMiddleware } from '@/middleware/auth.middleware'
import {
  loadUserAbilities,
  requirePermission,
} from '@/middleware/authorization.middleware'

export async function plansRoutes(fastify: FastifyInstance) {
  const planController = PlanFactory.getPlanController()

  // Rotas públicas (usuários podem ver planos disponíveis)
  fastify.get('/', {
    preHandler: [authMiddleware, loadUserAbilities],
    handler: planController.index.bind(planController),
  })

  fastify.get('/:id', {
    preHandler: [authMiddleware, loadUserAbilities],
    handler: planController.show.bind(planController),
  })

  // Rotas administrativas (apenas admins)
  fastify.post('/', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.CREATE, 'Plan'),
    ],
    handler: planController.store.bind(planController),
  })

  fastify.put('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.UPDATE, 'Plan'),
    ],
    handler: planController.update.bind(planController),
  })

  fastify.delete('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.DELETE, 'Plan'),
    ],
    handler: planController.destroy.bind(planController),
  })

  fastify.patch('/:id/deactivate', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.UPDATE, 'Plan'),
    ],
    handler: planController.deactivate.bind(planController),
  })

  fastify.patch('/:id/activate', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.UPDATE, 'Plan'),
    ],
    handler: planController.activate.bind(planController),
  })
}
