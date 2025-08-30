import { ForbiddenError } from '@casl/ability'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { AppAbility, defineAbilityFor } from '@/lib/casl'
import { prisma } from '@/lib/prisma'
import { ResponseFormatter } from '@/utils/response'

// Estender o tipo FastifyRequest para incluir ability
declare module 'fastify' {
  interface FastifyRequest {
    ability: AppAbility
  }
}

// Middleware para carregar as permissões do usuário
export async function loadUserAbilities(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Verificar se o usuário está autenticado
    if (!request.user?.sub) {
      return ResponseFormatter.error(
        reply,
        'Usuário não autenticado',
        undefined,
        401,
      )
    }

    // Buscar o usuário com o plano
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
      include: {
        plan: true,
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

    // Definir as permissões do usuário
    request.ability = defineAbilityFor(user)

    // Adicionar o usuário completo ao request para uso posterior
    request.user = { ...request.user, ...user }
  } catch (error: any) {
    request.log.error(
      {
        userId: request.user?.sub,
        error: error?.message,
      },
      'Erro ao carregar permissões do usuário',
    )
    return ResponseFormatter.error(
      reply,
      'Erro interno do servidor',
      undefined,
      500,
    )
  }
}

// Middleware para verificar permissões específicas
export function requirePermission(action: string, subject: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.ability) {
        return ResponseFormatter.error(
          reply,
          'Permissões não carregadas',
          undefined,
          500,
        )
      }

      // Verificar se o usuário tem a permissão necessária
      if (!request.ability.can(action, subject)) {
        return ResponseFormatter.error(
          reply,
          'Acesso negado: permissão insuficiente',
          {
            required: `${action} ${subject}`,
            userRole: request.user?.role,
            userPlan: request.user?.plan?.name,
          },
          403,
        )
      }
    } catch (error: any) {
      request.log.error(
        {
          action,
          subject,
          userId: request.user?.sub,
          error: error?.message,
        },
        'Erro ao verificar permissões',
      )
      return ResponseFormatter.error(
        reply,
        'Erro interno do servidor',
        undefined,
        500,
      )
    }
  }
}

// Middleware para verificar se o usuário pode acessar um recurso específico
export function requireResourcePermission(
  action: string,
  subject: string,
  getResource: (request: FastifyRequest) => any,
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.ability) {
        return ResponseFormatter.error(
          reply,
          'Permissões não carregadas',
          undefined,
          500,
        )
      }

      const resource = await getResource(request)

      if (!resource) {
        return ResponseFormatter.error(
          reply,
          'Recurso não encontrado',
          undefined,
          404,
        )
      }

      // Verificar se o usuário tem permissão para acessar este recurso específico
      const resourceSubject = subject(subject, resource)

      if (!request.ability.can(action, resourceSubject)) {
        return ResponseFormatter.error(
          reply,
          'Acesso negado: você não tem permissão para acessar este recurso',
          {
            required: `${action} ${subject}`,
            resourceId: resource.id,
          },
          403,
        )
      }
    } catch (error: any) {
      request.log.error(
        {
          action,
          subject,
          userId: request.user?.sub,
          error: error?.message,
        },
        'Erro ao verificar permissões de recurso',
      )
      return ResponseFormatter.error(
        reply,
        'Erro interno do servidor',
        undefined,
        500,
      )
    }
  }
}

// Plugin para registrar os middlewares de autorização
export async function authorizationPlugin(fastify: FastifyInstance) {
  // Registrar o middleware de carregamento de permissões
  fastify.decorate('loadUserAbilities', loadUserAbilities)

  // Registrar os middlewares de verificação de permissões
  fastify.decorate('requirePermission', requirePermission)
  fastify.decorate('requireResourcePermission', requireResourcePermission)

  // Helper para verificar permissões programaticamente
  fastify.decorate(
    'checkPermission',
    (ability: AppAbility, action: string, subjectOrResource: any) => {
      try {
        ForbiddenError.from(ability).throwUnlessCan(action, subjectOrResource)
        return true
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return false
        }
        throw error
      }
    },
  )
}

// Tipos para extensão do Fastify
declare module 'fastify' {
  interface FastifyInstance {
    loadUserAbilities: typeof loadUserAbilities
    requirePermission: typeof requirePermission
    requireResourcePermission: typeof requireResourcePermission
    checkPermission: (
      ability: AppAbility,
      action: string,
      subjectOrResource: any,
    ) => boolean
  }
}
