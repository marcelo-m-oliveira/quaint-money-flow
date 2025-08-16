/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { prisma } from '@/lib/prisma'
import { ResponseFormatter } from '@/utils/response'

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
      return ResponseFormatter.error(
        reply,
        'Token de acesso requerido',
        undefined,
        401,
      )
    }

    const [, token] = authHeader.split(' ')

    if (!token) {
      request.log.warn(
        { ...requestInfo },
        'Token de acesso invalido ou malformado',
      )
      return ResponseFormatter.error(
        reply,
        'Token de acesso invalido',
        undefined,
        401,
      )
    }

    // Para desenvolvimento, vamos usar um usuário padrão
    // Em produção, você deve decodificar o JWT token aqui
    try {
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
        return ResponseFormatter.error(
          reply,
          'Usuario nao encontrado',
          undefined,
          401,
        )
      }

      // Adicionar usuario ao request
      request.user = {
        ...user,
        sub: user.id,
      }

      console.log('User added to request:', request.user)

      request.log.info(
        { ...requestInfo, userId: user.id, userEmail: user.email },
        'Autenticacao realizada com sucesso',
      )
    } catch (dbError: any) {
      request.log.error(
        {
          method: request.method,
          url: request.url,
          ip: request.ip,
          error: dbError.message,
        },
        'Erro ao buscar usuario no banco de dados',
      )
      return ResponseFormatter.error(
        reply,
        'Erro interno do servidor',
        undefined,
        500,
      )
    }
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
    return ResponseFormatter.error(
      reply,
      'Token de acesso inválido',
      undefined,
      401,
    )
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
