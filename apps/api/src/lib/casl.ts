import { AbilityBuilder, ForcedSubject, PureAbility } from '@casl/ability'
import { createPrismaAbility, PrismaQuery } from '@casl/prisma'
import type { Plan, User } from '@prisma/client'

// Definir os subjects que podem ser controlados pelo CASL
type AppSubjects =
  | 'User'
  | 'Account'
  | 'Category'
  | 'Entry'
  | 'CreditCard'
  | 'Plan'
  | 'Coupon'
  | 'all'

type AppAbilities = [
  string,
  AppSubjects | ForcedSubject<Exclude<AppSubjects, 'all'>>,
]

export type AppAbility = PureAbility<AppAbilities, PrismaQuery>

// Definir ações possíveis
export const Actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage', // Todas as ações
} as const

// Interface para usuário com plano
interface UserWithPlan extends User {
  plan?: Plan | null
}

// Definir permissões baseadas no plano do usuário
export function defineAbilityFor(user: UserWithPlan): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createPrismaAbility,
  )

  // Permissões básicas para todos os usuários autenticados
  if (user) {
    // Usuários podem ler e atualizar seus próprios dados
    can(Actions.READ, 'User', { id: user.id })
    can(Actions.UPDATE, 'User', { id: user.id })

    // Permissões baseadas no role
    if (user.role === 'admin') {
      // Admins podem fazer tudo
      can(Actions.MANAGE, 'all')
    } else {
      // Usuários normais - permissões baseadas no plano
      const planFeatures = user.plan?.features as any

      // Lançamentos (sempre ilimitados para todos os planos)
      can(Actions.MANAGE, 'Entry', { userId: user.id })

      // Categorias
      if (planFeatures?.categories?.unlimited) {
        can(Actions.MANAGE, 'Category', { userId: user.id })
      } else if (planFeatures?.categories?.limited) {
        can(Actions.READ, 'Category', { userId: user.id })
        can(Actions.CREATE, 'Category', { userId: user.id })
        can(Actions.UPDATE, 'Category', { userId: user.id })
        can(Actions.DELETE, 'Category', { userId: user.id })
        // Limitação será verificada no service layer
      }

      // Contas
      if (planFeatures?.accounts?.unlimited) {
        can(Actions.MANAGE, 'Account', { userId: user.id })
      } else if (planFeatures?.accounts?.limited) {
        can(Actions.READ, 'Account', { userId: user.id })
        can(Actions.CREATE, 'Account', { userId: user.id })
        can(Actions.UPDATE, 'Account', { userId: user.id })
        can(Actions.DELETE, 'Account', { userId: user.id })
        // Limitação será verificada no service layer
      }

      // Cartões de crédito
      if (planFeatures?.creditCards?.unlimited) {
        can(Actions.MANAGE, 'CreditCard', { userId: user.id })
      } else if (planFeatures?.creditCards?.limited) {
        can(Actions.READ, 'CreditCard', { userId: user.id })
        can(Actions.CREATE, 'CreditCard', { userId: user.id })
        can(Actions.UPDATE, 'CreditCard', { userId: user.id })
        can(Actions.DELETE, 'CreditCard', { userId: user.id })
        // Limitação será verificada no service layer
      }

      // Relatórios - todos podem ler, mas tipo depende do plano
      can(Actions.READ, 'Entry', { userId: user.id }) // Para gerar relatórios

      // Não podem gerenciar outros usuários, planos ou cupons
      cannot(Actions.MANAGE, 'User')
      cannot(Actions.MANAGE, 'Plan')
      cannot(Actions.MANAGE, 'Coupon')

      // Mas podem ler seus próprios dados
      can(Actions.READ, 'User', { id: user.id })
    }
  }

  return build()
}

// Helper para verificar limites baseados no plano
export function checkPlanLimits(
  user: UserWithPlan,
  resource: string,
  currentCount: number,
): boolean {
  if (user.role === 'admin') return true

  const planFeatures = user.plan?.features as any
  const resourceConfig = planFeatures?.[resource]

  if (resourceConfig?.unlimited) return true
  if (resourceConfig?.limited && resourceConfig?.max) {
    return currentCount < resourceConfig.max
  }

  return false
}

// Helper para verificar se o usuário tem acesso a relatórios avançados
export function hasAdvancedReports(user: UserWithPlan): boolean {
  if (user.role === 'admin') return true

  const planFeatures = user.plan?.features as any
  return planFeatures?.reports?.advanced === true
}
