import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { prisma } from '@/lib/prisma'
import { ResponseFormatter } from '@/utils/response'

// Middleware real para validar JWT em requisições autenticadas
export async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()

    // Verificar se o usuário está ativo
    const decoded = request.user as any
    if (decoded?.sub) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { isActive: true },
      })

      if (user && !user.isActive) {
        return ResponseFormatter.error(
          reply,
          'Conta desativada. Entre em contato com o administrador.',
          undefined,
          403,
        )
      }
    }
  } catch (error: any) {
    request.log.warn(
      {
        method: request.method,
        url: request.url,
        ip: request.ip,
        error: error?.message,
      },
      'Falha na verificação do token JWT',
    )
    return ResponseFormatter.error(
      reply,
      'Token de acesso inválido ou expirado',
      undefined,
      401,
    )
  }
}

// Compatibilidade: manter nome antigo exportado apontando para o novo middleware
export const authMiddleware = authenticateRequest

// Plugin para registrar o middleware de autenticação (opcional)
export async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      return authenticateRequest(request, reply)
    },
  )
}
