// Define os subjects que podem ser controlados pelo CASL
type AppSubjects = 
  | 'User'
  | 'Account'
  | 'Category'
  | 'Entry'
  | 'CreditCard'
  | 'UserPreferences'
  | 'Plan'
  | 'all'

// Define as ações possíveis
type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'

// Interface simplificada de habilidades
interface UserPermissions {
  [key: string]: boolean
}

// Interface do usuário para definição de habilidades
interface UserWithRole {
  id: string
  role: string
  planId: string | null
}

// Função para definir habilidades baseadas no papel do usuário
export function defineAbilitiesFor(user: UserWithRole): UserPermissions {
  const permissions: UserPermissions = {}

  switch (user.role) {
    case 'ADMIN':
      // Administradores podem fazer tudo
      permissions['manage:all'] = true
      permissions['create:Account'] = true
      permissions['read:Account'] = true
      permissions['update:Account'] = true
      permissions['delete:Account'] = true
      permissions['create:Category'] = true
      permissions['read:Category'] = true
      permissions['update:Category'] = true
      permissions['delete:Category'] = true
      permissions['create:Entry'] = true
      permissions['read:Entry'] = true
      permissions['update:Entry'] = true
      permissions['delete:Entry'] = true
      permissions['create:CreditCard'] = true
      permissions['read:CreditCard'] = true
      permissions['update:CreditCard'] = true
      permissions['delete:CreditCard'] = true
      permissions['manage:UserPreferences'] = true
      permissions['read:User'] = true
      permissions['update:User'] = true
      permissions['delete:User'] = true
      permissions['read:Plan'] = true
      break
      
    case 'PREMIUM':
      // Usuários premium têm acesso completo aos seus recursos + funcionalidades premium
      permissions['create:Account'] = true
      permissions['read:Account'] = true
      permissions['update:Account'] = true
      permissions['delete:Account'] = true
      permissions['create:Category'] = true
      permissions['read:Category'] = true
      permissions['update:Category'] = true
      permissions['delete:Category'] = true
      permissions['create:Entry'] = true
      permissions['read:Entry'] = true
      permissions['update:Entry'] = true
      permissions['delete:Entry'] = true
      permissions['create:CreditCard'] = true
      permissions['read:CreditCard'] = true
      permissions['update:CreditCard'] = true
      permissions['delete:CreditCard'] = true
      permissions['manage:UserPreferences'] = true
      permissions['read:User'] = true
      permissions['update:User'] = true
      permissions['read:Plan'] = true
      break
      
    case 'USER':
    default:
      // Usuários comuns têm acesso apenas aos seus próprios recursos
      permissions['create:Account'] = true
      permissions['read:Account'] = true
      permissions['update:Account'] = true
      permissions['delete:Account'] = true
      permissions['create:Category'] = true
      permissions['read:Category'] = true
      permissions['update:Category'] = true
      permissions['delete:Category'] = true
      permissions['create:Entry'] = true
      permissions['read:Entry'] = true
      permissions['update:Entry'] = true
      permissions['delete:Entry'] = true
      permissions['create:CreditCard'] = true
      permissions['read:CreditCard'] = true
      permissions['update:CreditCard'] = true
      permissions['delete:CreditCard'] = true
      permissions['manage:UserPreferences'] = true
      permissions['read:User'] = true
      permissions['update:User'] = true
      break
  }

  return permissions
}

// Função simplificada para verificar permissões
export function createAbilityForUser(user: UserWithRole): UserPermissions {
  return defineAbilitiesFor(user)
}

// Função para verificar permissão específica
export function canUserPerform(
  permissions: UserPermissions,
  action: Actions,
  subject: AppSubjects
): boolean {
  const key = `${action}:${subject}`
  return permissions[key] || permissions['manage:all'] || false
}

// Tipos para exportação
export type { Actions, AppSubjects, UserWithRole, UserPermissions }