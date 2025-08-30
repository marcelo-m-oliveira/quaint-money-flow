import { createAbilityForUser, canUserPerform, UserWithRole, UserPermissions } from '@/lib/casl'
import { prisma } from '@/lib/prisma'

export class PermissionService {
  // Buscar usuário com dados necessários para permissões
  static async getUserWithPermissions(userId: string): Promise<UserWithRole | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        planId: true,
      },
    })

    return user
  }

  // Criar habilidades para um usuário
  static async createUserAbility(userId: string): Promise<UserPermissions | null> {
    const user = await this.getUserWithPermissions(userId)
    if (!user) return null

    return createAbilityForUser(user)
  }

  // Verificar se o usuário pode executar uma ação
  static async canUserPerform(
    userId: string, 
    action: string, 
    subject: string
  ): Promise<boolean> {
    const abilities = await this.createUserAbility(userId)
    if (!abilities) return false

    return canUserPerform(abilities, action as any, subject as any)
  }

  // Verificar se o usuário tem papel específico
  static async hasRole(userId: string, roles: string | string[]): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId)
    if (!user) return false

    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    return allowedRoles.includes(user.role)
  }

  // Verificar se o usuário é proprietário do recurso
  static async isResourceOwner(userId: string, resourceUserId: string): Promise<boolean> {
    return userId === resourceUserId
  }

  // Obter limites do plano do usuário
  static async getUserPlanLimits(userId: string): Promise<Record<string, any> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plan: true,
      },
    })

    if (!user?.plan) {
      // Retornar limites padrão para usuários sem plano
      return {
        maxAccounts: 5,
        maxCategories: 20,
        maxCreditCards: 3,
        maxEntriesPerMonth: 100,
        advancedReports: false,
        exportData: false,
      }
    }

    return user.plan.limits as Record<string, any>
  }

  // Verificar se o usuário está dentro dos limites do plano
  static async checkPlanLimits(
    userId: string, 
    resource: string, 
    currentCount?: number
  ): Promise<{ allowed: boolean; limit?: number; current?: number }> {
    const limits = await this.getUserPlanLimits(userId)
    if (!limits) return { allowed: true }

    const limitKey = `max${resource.charAt(0).toUpperCase() + resource.slice(1)}`
    const limit = limits[limitKey]

    if (typeof limit !== 'number') {
      return { allowed: true }
    }

    if (currentCount === undefined) {
      // Buscar contagem atual baseada no tipo de recurso
      switch (resource) {
        case 'accounts':
          currentCount = await prisma.account.count({ where: { userId } })
          break
        case 'categories':
          currentCount = await prisma.category.count({ where: { userId } })
          break
        case 'creditCards':
          currentCount = await prisma.creditCard.count({ where: { userId } })
          break
        default:
          return { allowed: true }
      }
    }

    return {
      allowed: (currentCount || 0) < limit,
      limit,
      current: currentCount,
    }
  }
}