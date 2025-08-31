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

  // Listar planos
  fastify.get('/', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Plan'),
    ],
    handler: planController.index.bind(planController),
  })

  // Buscar plano específico
  fastify.get('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Plan'),
    ],
    handler: planController.show.bind(planController),
  })

  // Criar novo plano
  fastify.post('/', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Plan'),
    ],
    handler: planController.store.bind(planController),
  })

  // Atualizar plano
  fastify.put('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Plan'),
    ],
    handler: planController.update.bind(planController),
  })

  // Excluir plano
  fastify.delete('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Plan'),
    ],
    handler: planController.destroy.bind(planController),
  })

  // Ativar plano
  fastify.patch('/:id/activate', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Plan'),
    ],
    handler: planController.activate.bind(planController),
  })

  // Desativar plano
  fastify.patch('/:id/deactivate', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'Plan'),
    ],
    handler: planController.deactivate.bind(planController),
  })

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
