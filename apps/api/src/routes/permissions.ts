import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { authMiddleware } from '@/middleware/auth.middleware'
import { authorize, requireRole } from '@/middleware/permissions.middleware'
import { performanceMiddleware } from '@/middleware/performance.middleware'
import { rateLimitMiddlewares } from '@/middleware/rate-limit.middleware'
import { validateBody, validateParams } from '@/middleware/validation.middleware'
import { PermissionService } from '@/services/permission.service'
import { prisma } from '@/lib/prisma'
import { ResponseFormatter } from '@/utils/response'

export async function permissionRoutes(app: FastifyInstance) {
  
  // GET /permissions/my-abilities - Obter habilidades do usuário atual
  app.get(
    '/permissions/my-abilities',
    {
      schema: {
        tags: ['🔒 Permissões'],
        summary: 'Minhas Habilidades',
        description: 'Retorna as habilidades e permissões do usuário atual',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            role: z.string(),
            planId: z.string().nullable(),
            abilities: z.record(z.string(), z.boolean()),
            limits: z.record(z.string(), z.any()).nullable(),
          }),
        },
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    async (request, reply) => {
      try {
        const decoded = request.user as any
        const userId = decoded.sub

        const user = await PermissionService.getUserWithPermissions(userId)
        if (!user) {
          return ResponseFormatter.error(
            reply,
            'Usuário não encontrado',
            undefined,
            404,
          )
        }

        const limits = await PermissionService.getUserPlanLimits(userId)
        const abilities = await PermissionService.createUserAbility(userId) || {}

        return reply.status(200).send({
          role: user.role,
          planId: user.planId,
          abilities,
          limits,
        })
      } catch (error) {
        request.log.error(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'Erro ao buscar habilidades do usuário',
        )
        return ResponseFormatter.error(
          reply,
          'Erro interno do servidor',
          undefined,
          500,
        )
      }
    },
  )

  // PUT /permissions/users/:id/role - Alterar papel de usuário (apenas admins)
  app.put(
    '/permissions/users/:id/role',
    {
      schema: {
        tags: ['🔒 Permissões'],
        summary: 'Alterar Papel do Usuário',
        description: 'Altera o papel de um usuário (apenas administradores)',
        params: z.object({
          id: z.string().min(1, 'ID é obrigatório'),
        }),
        body: z.object({
          role: z.enum(['USER', 'PREMIUM', 'ADMIN']),
        }),
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            message: z.string(),
            user: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string(),
              role: z.string(),
            }),
          }),
        },
      },
      preHandler: [
        authMiddleware,
        requireRole(['ADMIN']),
        performanceMiddleware(),
        validateParams(z.object({ id: z.string().min(1) })),
        validateBody(z.object({ role: z.enum(['USER', 'PREMIUM', 'ADMIN']) })),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    async (request, reply) => {
      try {
        const { id: targetUserId } = request.params as any
        const { role } = request.body as any

        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true, email: true, name: true, role: true },
        })

        if (!targetUser) {
          return ResponseFormatter.error(
            reply,
            'Usuário não encontrado',
            undefined,
            404,
          )
        }

        const updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: { role },
          select: { id: true, email: true, name: true, role: true },
        })

        request.log.info(
          {
            adminId: (request.user as any).sub,
            targetUserId: updatedUser.id,
            oldRole: targetUser.role,
            newRole: updatedUser.role,
          },
          'Papel de usuário alterado por administrador',
        )

        return reply.status(200).send({
          message: 'Papel do usuário alterado com sucesso',
          user: updatedUser,
        })
      } catch (error) {
        request.log.error(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'Erro ao alterar papel do usuário',
        )
        return ResponseFormatter.error(
          reply,
          'Erro interno do servidor',
          undefined,
          500,
        )
      }
    },
  )

  // GET /permissions/users - Listar usuários (apenas admins)
  app.get(
    '/permissions/users',
    {
      schema: {
        tags: ['🔒 Permissões'],
        summary: 'Listar Usuários',
        description: 'Lista todos os usuários do sistema (apenas administradores)',
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          page: z.number().min(1).default(1).optional(),
          limit: z.number().min(1).max(100).default(20).optional(),
          search: z.string().optional(),
          role: z.enum(['USER', 'PREMIUM', 'ADMIN']).optional(),
        }),
        response: {
          200: z.object({
            users: z.array(z.object({
              id: z.string(),
              email: z.string(),
              name: z.string(),
              role: z.string(),
              planId: z.string().nullable(),
              createdAt: z.number(),
              updatedAt: z.number(),
            })),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
              hasNext: z.boolean(),
              hasPrev: z.boolean(),
            }),
          }),
        },
      },
      preHandler: [
        authMiddleware,
        requireRole(['ADMIN']),
        performanceMiddleware(),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const page = query.page || 1
        const limit = query.limit || 20
        const skip = (page - 1) * limit
        
        const where = {
          ...(query.search && {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as any } },
              { email: { contains: query.search, mode: 'insensitive' as any } },
            ],
          }),
          ...(query.role && { role: query.role }),
        }

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              planId: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
          prisma.user.count({ where }),
        ])

        const totalPages = Math.ceil(total / limit)

        return reply.status(200).send({
          users: users.map(user => ({
            ...user,
            createdAt: Math.floor(user.createdAt.getTime() / 1000),
            updatedAt: Math.floor(user.updatedAt.getTime() / 1000),
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        })
      } catch (error) {
        request.log.error(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'Erro ao listar usuários',
        )
        return ResponseFormatter.error(
          reply,
          'Erro interno do servidor',
          undefined,
          500,
        )
      }
    },
  )

  // GET /permissions/check-limits/:resource - Verificar limites do plano
  app.get(
    '/permissions/check-limits/:resource',
    {
      schema: {
        tags: ['🔒 Permissões'],
        summary: 'Verificar Limites do Plano',
        description: 'Verifica se o usuário está dentro dos limites do seu plano',
        params: z.object({
          resource: z.enum(['accounts', 'categories', 'creditCards']),
        }),
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            allowed: z.boolean(),
            limit: z.number().optional(),
            current: z.number().optional(),
            remaining: z.number().optional(),
          }),
        },
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    async (request, reply) => {
      try {
        const decoded = request.user as any
        const userId = decoded.sub
        const { resource } = request.params as any

        const limits = await PermissionService.checkPlanLimits(userId, resource)

        const response = {
          ...limits,
          remaining: limits.limit && limits.current 
            ? Math.max(0, limits.limit - limits.current)
            : undefined,
        }

        return reply.status(200).send(response)
      } catch (error) {
        request.log.error(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'Erro ao verificar limites do plano',
        )
        return ResponseFormatter.error(
          reply,
          'Erro interno do servidor',
          undefined,
          500,
        )
      }
    },
  )
}