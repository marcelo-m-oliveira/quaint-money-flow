import { FastifyReply, FastifyRequest } from 'fastify'

import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedError('Token de acesso requerido')
    }

    const [, token] = authHeader.split(' ')

    if (!token) {
      throw new UnauthorizedError('Token de acesso inválido')
    }

    const payload = ''

    // Verificar se o usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: '' },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado')
    }

    // Adicionar usuário ao request
    request.user = user
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error
    }
    throw new UnauthorizedError('Token de acesso inválido')
  }
}

// Plugin para registrar o middleware de autenticação
export async function authPlugin(fastify: any) {
  fastify.decorate('authenticate', authMiddleware)
}
