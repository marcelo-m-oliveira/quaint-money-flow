import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { createAbilityForUser, canUserPerform, Actions, AppSubjects } from '@/lib/casl'
import { prisma } from '@/lib/prisma'
import { ResponseFormatter } from '@/utils/response'

// Interface para definir permissões necessárias
interface PermissionCheck {
  action: Actions
  subject: AppSubjects
}

// Middleware de autorização que verifica permissões
export function authorize(permission: PermissionCheck | PermissionCheck[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      // Verificar se o usuário está autenticado
      const decoded = request.user as any
      if (!decoded?.sub) {
        return ResponseFormatter.error(
          reply,
          'Usuário não autenticado',
          undefined,
          401,
        )
      }

      // Buscar dados completos do usuário para definir habilidades
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          role: true,
          planId: true,
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

      // Criar habilidades do usuário
      const abilities = createAbilityForUser(user)

      // Verificar permissões (pode ser uma ou múltiplas)
      const permissions = Array.isArray(permission) ? permission : [permission]
      
      for (const perm of permissions) {
        if (!canUserPerform(abilities, perm.action, perm.subject)) {
          request.log.warn(
            {
              userId: user.id,
              userRole: user.role,
              action: perm.action,
              subject: perm.subject,
            },
            'Acesso negado: usuário não tem permissão',
          )

          return ResponseFormatter.error(
            reply,
            'Acesso negado: você não tem permissão para executar esta ação',
            undefined,
            403,
          )
        }
      }

      // Adicionar dados do usuário ao request para uso posterior
      request.user = { ...decoded, role: user.role, planId: user.planId }

    } catch (error) {
      request.log.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Erro ao verificar permissões',
      )
      
      return ResponseFormatter.error(
        reply,
        'Erro interno ao verificar permissões',
        undefined,
        500,
      )
    }
  }
}

// Middleware para verificar se o usuário tem papel específico
export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const decoded = request.user as any
    if (!decoded?.sub) {
      return ResponseFormatter.error(
        reply,
        'Usuário não autenticado',
        undefined,
        401,
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true },
    })

    if (!user || !allowedRoles.includes(user.role)) {
      return ResponseFormatter.error(
        reply,
        'Acesso negado: papel insuficiente',
        undefined,
        403,
      )
    }

    request.user = { ...decoded, role: user.role }
  }
}

// Plugin para registrar middlewares de permissão
export async function permissionsPlugin(fastify: FastifyInstance) {
  fastify.decorate('authorize', authorize)
  fastify.decorate('requireRole', requireRole)
}

// Exportar tipos para uso em outras partes da aplicação
export type { PermissionCheck }