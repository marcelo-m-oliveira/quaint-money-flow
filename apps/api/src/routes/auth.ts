import { randomUUID } from 'node:crypto'

import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { getRedisClient } from '@/lib/redis'
import { authMiddleware } from '@/middleware/auth.middleware'
import { performanceMiddleware } from '@/middleware/performance.middleware'
import { rateLimitMiddlewares } from '@/middleware/rate-limit.middleware'
import { ResponseFormatter } from '@/utils/response'
import { loginSchema } from '@/utils/schemas'

export async function authRoutes(app: FastifyInstance) {
  const redis = getRedisClient()

  function getJwtExpiresIn() {
    return (process.env.JWT_EXPIRES_IN as string) || '15m'
  }

  function getRefreshTokenExpiresInSeconds(): number {
    const value = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
    // Parse like 30d/12h/900s or number of seconds
    const match = value.match(/^(\d+)([smhd])?$/)
    if (!match) return 60 * 60 * 24 * 30
    const amount = parseInt(match[1], 10)
    const unit = match[2] || 's'
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    }
    if (!multipliers[unit]) return amount
    return amount * multipliers[unit]
  }

  async function signAccessToken(payload: Record<string, any>) {
    return app.jwt.sign(payload, {
      expiresIn: getJwtExpiresIn(),
    } as any)
  }

  async function signRefreshToken(userId: string) {
    const jti = randomUUID()
    const expiresInSeconds = getRefreshTokenExpiresInSeconds()
    const token = app.jwt.sign({ sub: userId, jti, type: 'refresh' }, {
      expiresIn: expiresInSeconds,
    } as any)

    await redis.set(
      `refresh:${jti}`,
      JSON.stringify({ userId }),
      'EX',
      expiresInSeconds,
    )

    // Registrar no banco para auditoria
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)
    await prisma.refreshToken.create({
      data: {
        jti,
        userId,
        expiresAt,
      },
    })

    return { token, jti, expiresInSeconds }
  }

  // POST /auth/login - email/senha
  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['🔐 Autenticação'],
        summary: 'Login com email e senha',
        security: [],
        body: loginSchema,
        response: {
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            user: z.object({
              id: z.string(),
              email: z.string().email(),
              name: z.string(),
              avatarUrl: z.string().url().nullable().optional(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as any

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return ResponseFormatter.error(
          reply,
          'Credenciais inválidas',
          undefined,
          401,
        )
      }

      const passwordOk = await bcrypt.compare(password, user.password)
      if (!passwordOk) {
        return ResponseFormatter.error(
          reply,
          'Credenciais inválidas',
          undefined,
          401,
        )
      }

      const payload = {
        sub: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
      }
      const accessToken = await signAccessToken(payload)
      const refresh = await signRefreshToken(user.id)

      return reply.status(200).send({
        accessToken,
        refreshToken: refresh.token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl ?? null,
        },
      })
    },
  )

  // POST /auth/register - criar conta com email/senha
  app.post(
    '/auth/register',
    {
      schema: {
        tags: ['🔐 Autenticação'],
        summary: 'Cria uma conta com nome, email e senha',
        security: [],
        body: z
          .object({
            name: z.string().min(1),
            email: z.string().email(),
            password: z
              .string()
              .min(8, 'A senha deve ter pelo menos 8 caracteres')
              .refine(
                (val) => /[a-z]/.test(val),
                'A senha deve conter letra minúscula',
              )
              .refine(
                (val) => /[A-Z]/.test(val),
                'A senha deve conter letra maiúscula',
              )
              .refine((val) => /\d/.test(val), 'A senha deve conter número')
              .refine(
                (val) => /[^\w\s]/.test(val),
                'A senha deve conter caractere especial',
              ),
          })
          .strict(),
        response: {
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            user: z.object({
              id: z.string(),
              email: z.string().email(),
              name: z.string(),
              avatarUrl: z.string().url().nullable().optional(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body as any
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return ResponseFormatter.error(
          reply,
          'Email já cadastrado',
          undefined,
          400,
        )
      }
      const hashed = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          passwordConfigured: true, // Usuários que se registram com email/senha já têm senha configurada
        },
      })

      const payload = {
        sub: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
      }
      const accessToken = await signAccessToken(payload)
      const refresh = await signRefreshToken(user.id)

      return reply.status(200).send({
        accessToken,
        refreshToken: refresh.token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl ?? null,
        },
      })
    },
  )

  // GET /auth/google/callback - Google OAuth2
  app.get(
    '/auth/google/callback',
    {
      schema: {
        tags: ['🔐 Autenticação'],
        summary: 'Callback de login via Google OAuth2',
        security: [],
      },
    },
    async (request, reply) => {
      try {
        request.log.info('Google OAuth callback started')

        const { env } = await import('@saas/env')
        const { code } = request.query as any
        const clientId = env.GOOGLE_CLIENT_ID
        const clientSecret = env.GOOGLE_CLIENT_SECRET
        const redirectUri = env.GOOGLE_REDIRECT_URI

        request.log.info(
          { clientId: !!clientId, clientSecret: !!clientSecret, redirectUri },
          'Google OAuth config',
        )

        if (!clientId || !clientSecret || !redirectUri) {
          request.log.error('Google OAuth2 configuration missing')
          return ResponseFormatter.error(
            reply,
            'Configuração do Google OAuth2 ausente',
            undefined,
            500,
          )
        }

        if (!code) {
          request.log.error('Missing authorization code')
          return ResponseFormatter.error(
            reply,
            'Código de autorização não fornecido',
            undefined,
            400,
          )
        }

        // Troca code -> tokens
        const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        })

        if (!tokenResp.ok) {
          const err = await tokenResp.text()
          request.log.error(
            { err, status: tokenResp.status },
            'Falha ao trocar code por token no Google',
          )
          return ResponseFormatter.error(
            reply,
            'Falha na autenticação Google',
            undefined,
            401,
          )
        }

        // eslint-disable-next-line camelcase
        const { access_token } = (await tokenResp.json()) as any

        // eslint-disable-next-line camelcase
        if (!access_token) {
          request.log.error('No access token received from Google')
          return ResponseFormatter.error(
            reply,
            'Token de acesso não recebido do Google',
            undefined,
            401,
          )
        }

        // Buscar perfil
        const profileResp = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            // eslint-disable-next-line camelcase
            headers: { Authorization: `Bearer ${access_token}` },
          },
        )

        if (!profileResp.ok) {
          const err = await profileResp.text()
          request.log.error(
            { err, status: profileResp.status },
            'Falha ao obter perfil do Google',
          )
          return ResponseFormatter.error(
            reply,
            'Falha na autenticação Google',
            undefined,
            401,
          )
        }

        const profile = (await profileResp.json()) as any
        const email = profile.email as string
        const name = (profile.name as string) || email
        const picture = (profile.picture as string) || undefined
        const providerUserId = profile.sub as string

        if (!email) {
          request.log.error('No email available in Google profile')
          return ResponseFormatter.error(
            reply,
            'Email não disponível no Google',
            undefined,
            400,
          )
        }

        // Verificar se já existe um usuário com este email
        let user = await prisma.user.findUnique({
          where: { email },
          include: {
            providers: {
              where: { provider: 'google' },
            },
          },
        })

        let isNewUser = false
        let needsPasswordSetup = false

        if (!user) {
          // Usuário não existe - criar novo
          const randomPasswordHash = await bcrypt.hash(randomUUID(), 10)
          user = await prisma.user.create({
            data: {
              email,
              name,
              password: randomPasswordHash,
              passwordConfigured: false, // Senha não foi configurada pelo usuário
              avatarUrl: picture,
            },
            include: {
              providers: {
                where: { provider: 'google' },
              },
            },
          })
          isNewUser = true
          needsPasswordSetup = true
          request.log.info(
            { userId: user.id, email },
            'Novo usuário criado via Google OAuth',
          )
        } else {
          // Usuário existe - verificar se já tem vínculo com Google
          const hasGoogleProvider = user.providers.length > 0

          if (!hasGoogleProvider) {
            // Usuário existe mas não tem vínculo com Google - vincular
            request.log.info(
              { userId: user.id, email },
              'Vinculando conta existente com Google OAuth',
            )
          }

          // Atualizar avatar se necessário
          if (!user.avatarUrl && picture) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { avatarUrl: picture },
              include: {
                providers: {
                  where: { provider: 'google' },
                },
              },
            })
            request.log.info(
              { userId: user.id, email },
              'Avatar do usuário atualizado via Google OAuth',
            )
          }

          // Verificar se precisa configurar senha
          // Usuários que já têm senha configurada (passwordConfigured: true) não precisam configurar
          // Usuários que foram criados via Google (passwordConfigured: false) precisam configurar
          needsPasswordSetup = !user.passwordConfigured

          request.log.info(
            {
              userId: user.id,
              email,
              passwordConfigured: user.passwordConfigured,
              needsPasswordSetup,
              isExistingUser: true,
              userPasswordLength: user.password?.length || 0,
              hasValidPassword: user.passwordConfigured,
            },
            'Verificação de configuração de senha para usuário existente',
          )
        }

        // Vincular/atualizar provedor
        if (providerUserId) {
          await prisma.userProvider.upsert({
            where: {
              provider_providerUserId: {
                provider: 'google',
                providerUserId,
              },
            },
            update: { userId: user.id },
            create: {
              userId: user.id,
              provider: 'google',
              providerUserId,
            },
          })
        }

        const payload = {
          sub: user.id,
          id: user.id,
          email: user.email,
          name: user.name,
        }
        const accessToken = await signAccessToken(payload)
        const refresh = await signRefreshToken(user.id)

        request.log.info(
          {
            userId: user.id,
            email,
            isNewUser,
            needsPasswordSetup,
            passwordConfigured: user.passwordConfigured,
            hasGoogleProvider: user.providers.length > 0,
          },
          'Login via Google OAuth realizado com sucesso',
        )

        const responseData = {
          accessToken,
          refreshToken: refresh.token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl ?? null,
          },
          metadata: {
            isNewUser,
            needsPasswordSetup,
            hasGoogleProvider: user.providers.length > 0,
          },
        }

        request.log.info(
          {
            metadata: responseData.metadata,
            needsPasswordSetup: responseData.metadata.needsPasswordSetup,
          },
          'Resposta do callback do Google OAuth',
        )

        return reply.status(200).send(responseData)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        const errorStack = error instanceof Error ? error.stack : undefined
        request.log.error(
          { error: errorMessage, stack: errorStack },
          'Erro inesperado no callback do Google OAuth',
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

  // POST /auth/setup-password - Configurar senha para usuários Google
  app.post(
    '/auth/setup-password',
    {
      schema: {
        tags: ['🔐 Autenticação'],
        summary: 'Configurar senha para usuários que se registraram via Google',
        security: [{ bearerAuth: [] }],
        body: z
          .object({
            password: z
              .string()
              .min(8, 'Senha deve ter pelo menos 8 caracteres')
              .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'Senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial',
              ),
            confirmPassword: z
              .string()
              .min(1, 'Confirmação de senha é obrigatória'),
          })
          .refine((data) => data.password === data.confirmPassword, {
            message: 'Senhas não coincidem',
            path: ['confirmPassword'],
          })
          .strict(),
        response: {
          200: z.object({
            message: z.string(),
            user: z.object({
              id: z.string(),
              email: z.string().email(),
              name: z.string(),
              avatarUrl: z.string().url().nullable().optional(),
            }),
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
      const { password, confirmPassword } = request.body as any
      const decoded = request.user as any
      const userId = decoded?.sub as string

      if (password !== confirmPassword) {
        return ResponseFormatter.error(
          reply,
          'Senhas não coincidem',
          undefined,
          400,
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          providers: {
            where: { provider: 'google' },
          },
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

      // Verificar se o usuário tem vínculo com Google
      if (user.providers.length === 0) {
        return ResponseFormatter.error(
          reply,
          'Esta funcionalidade é apenas para usuários que se registraram via Google',
          undefined,
          400,
        )
      }

      // Verificar se já tem uma senha configurada pelo usuário
      if (user.passwordConfigured) {
        return ResponseFormatter.error(
          reply,
          'Senha já foi configurada para esta conta',
          undefined,
          400,
        )
      }

      // Configurar nova senha
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordConfigured: true, // Marcar que a senha foi configurada pelo usuário
        },
      })

      request.log.info(
        { userId: user.id, email: user.email },
        'Senha configurada para usuário Google',
      )

      return reply.status(200).send({
        message: 'Senha configurada com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl ?? null,
        },
      })
    },
  )

  // POST /auth/refresh - renovar access token
  app.post(
    '/auth/refresh',
    {
      schema: {
        tags: ['🔐 Autenticação'],
        summary: 'Renova o access token a partir de um refresh token válido',
        security: [],
        body: {
          type: 'object',
          properties: { refreshToken: { type: 'string' } },
          required: ['refreshToken'],
        },
        response: {
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            user: z.object({
              id: z.string(),
              email: z.string().email(),
              name: z.string(),
              avatarUrl: z.string().url().nullable().optional(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body as any
      try {
        const decoded = app.jwt.verify(refreshToken) as any
        if (decoded.type !== 'refresh' || !decoded.jti) {
          return ResponseFormatter.error(
            reply,
            'Refresh token inválido',
            undefined,
            401,
          )
        }

        const key = `refresh:${decoded.jti}`
        const exists = await redis.get(key)
        if (!exists) {
          return ResponseFormatter.error(
            reply,
            'Refresh token expirado ou revogado',
            undefined,
            401,
          )
        }

        // Rotacionar refresh token: revoga o atual e emite um novo
        await redis.del(key)
        await prisma.refreshToken.update({
          where: { jti: decoded.jti as string },
          data: { revokedAt: new Date() },
        })

        const userId = decoded.sub as string
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
          return ResponseFormatter.error(
            reply,
            'Usuário não encontrado',
            undefined,
            401,
          )
        }

        const payload = {
          sub: user.id,
          id: user.id,
          email: user.email,
          name: user.name,
        }
        const accessToken = await signAccessToken(payload)
        const refresh = await signRefreshToken(user.id)

        return reply.status(200).send({
          accessToken,
          refreshToken: refresh.token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl ?? null,
          },
        })
      } catch (error: any) {
        request.log.warn({ error: error?.message }, 'Falha ao renovar token')
        return ResponseFormatter.error(
          reply,
          'Refresh token inválido',
          undefined,
          401,
        )
      }
    },
  )

  // POST /auth/logout - invalida o refresh token
  app.post(
    '/auth/logout',
    {
      schema: {
        tags: ['🔐 Autenticação'],
        summary: 'Logout: invalida o refresh token informado',
        security: [],
        body: {
          type: 'object',
          properties: { refreshToken: { type: 'string' } },
          required: ['refreshToken'],
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body as any
      try {
        const decoded = app.jwt.verify(refreshToken) as any
        if (decoded.type !== 'refresh' || !decoded.jti) {
          return ResponseFormatter.error(
            reply,
            'Refresh token inválido',
            undefined,
            401,
          )
        }

        await redis.del(`refresh:${decoded.jti}`)
        await prisma.refreshToken.update({
          where: { jti: decoded.jti as string },
          data: { revokedAt: new Date() },
        })

        return ResponseFormatter.noContent(reply)
      } catch (error: any) {
        return ResponseFormatter.error(
          reply,
          'Refresh token inválido',
          undefined,
          401,
        )
      }
    },
  )
}
