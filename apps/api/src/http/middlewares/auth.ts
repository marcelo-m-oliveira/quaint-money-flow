import { FastifyInstance, FastifyRequest } from 'fastify'

import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export async function authMiddleware(request: FastifyRequest, reply: any) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.status(401).send({ message: 'Token de acesso requerido' })
    }

    const [, token] = authHeader.split(' ')

    if (!token) {
      return reply.status(401).send({ message: 'Token de acesso inválido' })
    }

    // Para desenvolvimento, vamos usar um usuário padrão
    // Em produção, você deve decodificar o JWT token aqui
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return reply.status(401).send({ message: 'Usuário não encontrado' })
    }

    // Adicionar usuário ao request
    request.user = {
      ...user,
      sub: user.id,
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error)
    return reply.status(401).send({ message: 'Token de acesso inválido' })
  }
}

// Plugin para registrar o middleware de autenticação
export async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', authMiddleware)
}
