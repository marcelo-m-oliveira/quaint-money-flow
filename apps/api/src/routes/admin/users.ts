import { FastifyInstance } from 'fastify'

import { UserManagementFactory } from '@/factories/user-management.factory'
import { Actions } from '@/lib/casl'
import { authMiddleware } from '@/middleware/auth.middleware'
import {
  loadUserAbilities,
  requirePermission,
} from '@/middleware/authorization.middleware'

export async function adminUsersRoutes(fastify: FastifyInstance) {
  const userController = UserManagementFactory.getUserManagementController()

  // Listar usuários
  fastify.get('/', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'User'),
    ],
    handler: userController.index.bind(userController),
  })

  // Buscar usuário específico
  fastify.get('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'User'),
    ],
    handler: userController.show.bind(userController),
  })

  // Criar novo usuário
  fastify.post('/', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'User'),
    ],
    handler: userController.store.bind(userController),
  })

  // Atualizar usuário
  fastify.put('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'User'),
    ],
    handler: userController.update.bind(userController),
  })

  // Excluir usuário
  fastify.delete('/:id', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'User'),
    ],
    handler: userController.destroy.bind(userController),
  })

  // Alterar senha do usuário
  fastify.patch('/:id/password', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'User'),
    ],
    schema: {
      body: {
        type: 'object',
        properties: {
          newPassword: { type: 'string', minLength: 1 },
        },
        required: ['newPassword'],
        additionalProperties: false,
      },
    },
    handler: userController.changePassword.bind(userController),
  })

  // Alterar plano do usuário
  fastify.patch('/:id/plan', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'User'),
    ],
    schema: {
      body: {
        type: 'object',
        properties: {
          planId: { type: 'string', minLength: 1 },
        },
        required: ['planId'],
        additionalProperties: false,
      },
    },
    handler: userController.changePlan.bind(userController),
  })

  // Ativar/desativar usuário
  fastify.patch('/:id/active', {
    preHandler: [
      authMiddleware,
      loadUserAbilities,
      requirePermission(Actions.MANAGE, 'User'),
    ],
    schema: {
      body: {
        type: 'object',
        properties: {
          isActive: { type: 'boolean' },
        },
        required: ['isActive'],
        additionalProperties: false,
      },
    },
    handler: userController.toggleActive.bind(userController),
  })
}
