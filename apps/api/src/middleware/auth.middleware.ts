import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { ResponseFormatter } from '@/utils/response'

// Middleware real para validar JWT em requisições autenticadas
export async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()
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
