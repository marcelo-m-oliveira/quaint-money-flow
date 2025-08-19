import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/middleware/auth.middleware'
import { performanceMiddleware } from '@/middleware/performance.middleware'
import { rateLimitMiddlewares } from '@/middleware/rate-limit.middleware'
import { validateBody } from '@/middleware/validation.middleware'
import { ResponseFormatter } from '@/utils/response'

const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().url().nullable().optional(),
})

export async function userRoutes(app: FastifyInstance) {
  // GET /users/me - Perfil atual
  app.get(
    '/users/me',
    {
      schema: {
        tags: ['👤 Usuários'],
        summary: 'Obter perfil do usuário autenticado',
        security: [{ bearerAuth: [] }],
        response: {
          200: userResponseSchema,
        },
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    async (request, reply) => {
      const decoded = request.user as any
      const userId = decoded?.sub as string
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        return ResponseFormatter.error(
          reply,
          'Usuário não encontrado',
          undefined,
          404,
        )
      }
      return reply.send({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl ?? null,
      })
    },
  )

  // PUT /users/me - Atualizar nome e avatarUrl
  app.put(
    '/users/me',
    {
      schema: {
        tags: ['👤 Usuários'],
        summary: 'Atualizar perfil do usuário autenticado',
        security: [{ bearerAuth: [] }],
        body: z
          .object({
            name: z.string().min(1),
            avatarUrl: z.string().url().nullable().optional(),
          })
          .strict(),
        response: {
          200: userResponseSchema,
        },
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateBody(
          z.object({
            name: z.string().min(1),
            avatarUrl: z.string().url().nullable().optional(),
          }),
        ),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    async (request, reply) => {
      const decoded = request.user as any
      const userId = decoded?.sub as string
      const { name, avatarUrl } = request.body as any
      const user = await prisma.user.update({
        where: { id: userId },
        data: { name, avatarUrl: avatarUrl ?? null },
      })
      return reply.send({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl ?? null,
      })
    },
  )

  // PUT /users/password - Alterar senha
  app.put(
    '/users/password',
    {
      schema: {
        tags: ['👤 Usuários'],
        summary: 'Alterar senha do usuário autenticado',
        security: [{ bearerAuth: [] }],
        body: z
          .object({
            currentPassword: z
              .string()
              .min(6, 'Senha atual deve ter pelo menos 6 caracteres'),
            newPassword: z
              .string()
              .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
              .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial',
              ),
          })
          .strict(),
        response: {
          204: z.null(),
        },
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateBody(
          z.object({
            currentPassword: z
              .string()
              .min(6, 'Senha atual deve ter pelo menos 6 caracteres'),
            newPassword: z
              .string()
              .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
              .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial',
              ),
          }),
        ),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    async (request, reply) => {
      const { currentPassword, newPassword } = request.body as any
      const decoded = request.user as any
      const userId = decoded?.sub as string
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        return ResponseFormatter.error(
          reply,
          'Usuário não encontrado',
          undefined,
          404,
        )
      }
      // compare password
      const bcrypt = await import('bcryptjs')
      const ok = await bcrypt.default.compare(currentPassword, user.password)
      if (!ok) {
        return ResponseFormatter.error(
          reply,
          'Senha atual inválida',
          undefined,
          400,
        )
      }
      const hashed = await bcrypt.default.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      })
      return reply.status(204).send()
    },
  )

  // GET /users/account-status - Verificar status da conta
  app.get(
    '/users/account-status',
    {
      schema: {
        tags: ['👤 Usuários'],
        summary: 'Verificar status da conta do usuário autenticado',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            hasGoogleProvider: z.boolean(),
            needsPasswordSetup: z.boolean(),
            hasValidPassword: z.boolean(),
            providers: z.array(
              z.object({
                provider: z.string(),
                providerUserId: z.string(),
                createdAt: z.string(),
              }),
            ),
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
      const decoded = request.user as any
      const userId = decoded?.sub as string

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          providers: true,
        },
      })

      if (!user) {
        return ResponseFormatter.error(
          reply,
          'Usuário não encontrado',
          undefined,
          404,
        )
      }

      // Verificar se tem vínculo com Google
      const hasGoogleProvider = user.providers.some(
        (p) => p.provider === 'google',
      )

      // Verificar se precisa configurar senha (usuário criado via Google sem senha definida)
      // Usar o campo passwordConfigured para determinar se a senha foi configurada pelo usuário
      const hasValidPassword = user.passwordConfigured
      const needsPasswordSetup = !hasValidPassword

      return reply.send({
        hasGoogleProvider,
        needsPasswordSetup,
        hasValidPassword,
        providers: user.providers.map((p) => ({
          provider: p.provider,
          providerUserId: p.providerUserId,
          createdAt: p.createdAt.toISOString(),
        })),
      })
    },
  )
}
