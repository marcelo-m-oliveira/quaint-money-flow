/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { prisma } from '@/lib/prisma'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = request.headers.authorization
    const requestInfo = {
      method: request.method,
      url: request.url,
      ip: request.ip,
    }

    request.log.info({ ...requestInfo }, 'Tentativa de autenticacao')

    if (!authHeader) {
      request.log.warn({ ...requestInfo }, 'Token de acesso nao fornecido')
      return reply.status(401).send({ message: 'Token de acesso requerido' })
    }

    const [, token] = authHeader.split(' ')

    if (!token) {
      request.log.warn(
        { ...requestInfo },
        'Token de acesso invalido ou malformado',
      )
      return reply.status(401).send({ message: 'Token de acesso invalido' })
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
      request.log.warn(
        { ...requestInfo },
        'Usuario nao encontrado na base de dados',
      )
      return reply.status(401).send({ message: 'Usuario nao encontrado' })
    }

    // Adicionar usuario ao request
    request.user = {
      ...user,
      sub: user.id,
    }

    request.log.info(
      { ...requestInfo, userId: user.id, userEmail: user.email },
      'Autenticacao realizada com sucesso',
    )
  } catch (error: any) {
    request.log.error(
      {
        method: request.method,
        url: request.url,
        ip: request.ip,
        error: error.message,
      },
      'Erro no middleware de autenticacao',
    )
    return reply.status(401).send({ message: 'Token de acesso inválido' })
  }
}

// Plugin para registrar o middleware de autenticação
export async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      return authMiddleware(request, reply)
    },
  )
}
