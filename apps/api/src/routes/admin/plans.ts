import { FastifyInstance } from 'fastify'

import { PlanFactory } from '@/factories/plan.factory'
import { Actions } from '@/lib/casl'
import { authMiddleware } from '@/middleware/auth.middleware'
import {
  loadUserAbilities,
  requirePermission,
} from '@/middleware/authorization.middleware'

export async function adminPlansRoutes(fastify: FastifyInstance) {
  const planController = PlanFactory.getPlanController()

  // Rotas administrativas para estatísticas de planos
  fastify.get('/stats', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.READ, 'Plan'),
    ],
    handler: planController.stats.bind(planController),
  })
}
