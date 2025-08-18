import { randomUUID } from 'node:crypto'

import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { getRedisClient } from '@/lib/redis'
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
            password: z.string().min(6),
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
        data: { name, email, password: hashed },
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
        querystring: {
          type: 'object',
          properties: { code: { type: 'string' } },
          required: ['code'],
        },
      },
    },
    async (request, reply) => {
      const { code } = request.query as any
      const clientId = process.env.GOOGLE_CLIENT_ID as string
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string
      const redirectUri = process.env.GOOGLE_REDIRECT_URI as string

      if (!clientId || !clientSecret || !redirectUri) {
        return ResponseFormatter.error(
          reply,
          'Configuração do Google OAuth2 ausente',
          undefined,
          500,
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
        request.log.error({ err }, 'Falha ao trocar code por token no Google')
        return ResponseFormatter.error(
          reply,
          'Falha na autenticação Google',
          undefined,
          401,
        )
      }

      // eslint-disable-next-line camelcase
      const { access_token } = (await tokenResp.json()) as any

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
        request.log.error({ err }, 'Falha ao obter perfil do Google')
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
        return ResponseFormatter.error(
          reply,
          'Email não disponível no Google',
          undefined,
          400,
        )
      }

      // Upsert usuário
      let user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        const randomPasswordHash = await bcrypt.hash(randomUUID(), 10)
        user = await prisma.user.create({
          data: {
            email,
            name,
            password: randomPasswordHash,
            avatarUrl: picture,
          },
        })
      } else if (!user.avatarUrl && picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: picture },
        })
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
