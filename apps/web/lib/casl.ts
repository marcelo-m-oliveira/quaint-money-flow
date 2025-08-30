import { defineAbility, PureAbility } from '@casl/ability'

// Definir os subjects que podem ser controlados pelo CASL
type AppSubjects =
  | 'Account'
  | 'Category'
  | 'Entry'
  | 'CreditCard'
  | 'Plan'
  | 'Coupon'
  | 'User'
  | 'all'

type AppAbilities = [string, AppSubjects]

export type AppAbility = PureAbility<AppAbilities>

// Definir ações possíveis
export const Actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage', // Todas as ações
} as const

// Interface para plano do usuário
export interface Plan {
  id: string
  name: string
  type: 'free' | 'monthly' | 'annual'
  price: number
  features: {
    entries?: { unlimited: boolean }
    categories?: { unlimited: boolean; limited?: boolean; max?: number }
    accounts?: { unlimited: boolean; limited?: boolean; max?: number }
    creditCards?: { unlimited: boolean; limited?: boolean; max?: number }
    reports?: { basic?: boolean; advanced?: boolean }
  }
}

// Interface para usuário com plano
export interface UserWithPlan {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  plan?: Plan | null
}

// Definir permissões baseadas no plano do usuário
export function defineAbilityFor(user: UserWithPlan | null): AppAbility {
  if (!user) {
    return defineAbility(() => {})
  }

  return defineAbility((can, cannot) => {
    // Usuários podem ler e atualizar seus próprios dados
    can(Actions.READ, 'User')
    can(Actions.UPDATE, 'User')

    // Permissões baseadas no role
    if (user.role === 'admin') {
      // Admins podem fazer tudo
      can(Actions.MANAGE, 'all')
    } else {
      // Usuários normais - permissões baseadas no plano
      const planFeatures = user.plan?.features || {}

      // Lançamentos (sempre ilimitados para todos os planos)
      can(Actions.MANAGE, 'Entry')

      // Categorias
      if (planFeatures.categories?.unlimited) {
        can(Actions.MANAGE, 'Category')
      } else if (planFeatures.categories?.limited) {
        can(Actions.MANAGE, 'Category')
        // Limitação será verificada na UI/API
      }

      // Contas
      if (planFeatures.accounts?.unlimited) {
        can(Actions.MANAGE, 'Account')
      } else if (planFeatures.accounts?.limited) {
        can(Actions.MANAGE, 'Account')
        // Limitação será verificada na UI/API
      }

      // Cartões de crédito
      if (planFeatures.creditCards?.unlimited) {
        can(Actions.MANAGE, 'CreditCard')
      } else if (planFeatures.creditCards?.limited) {
        can(Actions.MANAGE, 'CreditCard')
        // Limitação será verificada na UI/API
      }

      // Relatórios - todos podem ler básicos
      can(Actions.READ, 'Entry') // Para gerar relatórios básicos

      // Não podem gerenciar outros usuários, planos ou cupons
      cannot(Actions.CREATE, 'User')
      cannot(Actions.DELETE, 'User')
      cannot(Actions.MANAGE, 'Plan')
      cannot(Actions.MANAGE, 'Coupon')
    }
  })
}

// Helper para verificar se o usuário tem acesso a relatórios avançados
export function hasAdvancedReports(user: UserWithPlan | null): boolean {
  if (!user) return false
  if (user.role === 'admin') return true

  const planFeatures = user.plan?.features || {}
  return planFeatures.reports?.advanced === true
}

// Helper para verificar limites baseados no plano
export function checkPlanLimits(
  user: UserWithPlan | null,
  resource: string,
  currentCount: number,
): boolean {
  if (!user) return false
  if (user.role === 'admin') return true

  const planFeatures = user.plan?.features as any
  const resourceConfig = planFeatures?.[resource]

  if (resourceConfig?.unlimited) return true
  if (resourceConfig?.limited && resourceConfig?.max) {
    return currentCount < resourceConfig.max
  }

  return false
}

// Helper para obter informações do limite
export function getPlanLimitInfo(
  user: UserWithPlan | null,
  resource: string,
): {
  isUnlimited: boolean
  max: number | null
  canCreate: (currentCount: number) => boolean
} {
  if (!user || user.role === 'admin') {
    return {
      isUnlimited: true,
      max: null,
      canCreate: () => true,
    }
  }

  const planFeatures = user.plan?.features as any
  const resourceConfig = planFeatures?.[resource]

  if (resourceConfig?.unlimited) {
    return {
      isUnlimited: true,
      max: null,
      canCreate: () => true,
    }
  }

  if (resourceConfig?.limited && resourceConfig?.max) {
    return {
      isUnlimited: false,
      max: resourceConfig.max,
      canCreate: (currentCount: number) => currentCount < resourceConfig.max,
    }
  }

  return {
    isUnlimited: false,
    max: 0,
    canCreate: () => false,
  }
}
