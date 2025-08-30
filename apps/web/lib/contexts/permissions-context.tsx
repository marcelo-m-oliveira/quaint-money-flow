'use client'

import React, { createContext, useContext, useMemo } from 'react'

import { useAuthContext } from './auth-context'

// Define os subjects que podem ser controlados pelo CASL no frontend
type Subjects = 
  | 'Account' 
  | 'Category' 
  | 'Entry' 
  | 'CreditCard' 
  | 'UserPreferences'
  | 'Plan'
  | 'User'
  | 'AdvancedReports'
  | 'Export'
  | 'all'

// Define as ações possíveis
type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'

// Interface de permissões simplificada
interface UserPermissions {
  [key: string]: boolean
}

// Contexto de permissões
interface PermissionsContextType {
  permissions: UserPermissions
  can: (action: Actions, subject: Subjects) => boolean
  cannot: (action: Actions, subject: Subjects) => boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthContext()

  // Definir permissões baseadas no usuário autenticado
  const permissions = useMemo(() => {
    const perms: UserPermissions = {}

    if (!isAuthenticated || !user) {
      return perms
    }

    const userRole = user.role || 'USER'

    switch (userRole) {
      case 'ADMIN':
        // Administradores podem fazer tudo
        perms['manage:all'] = true
        perms['create:Account'] = true
        perms['read:Account'] = true
        perms['update:Account'] = true
        perms['delete:Account'] = true
        perms['create:Category'] = true
        perms['read:Category'] = true
        perms['update:Category'] = true
        perms['delete:Category'] = true
        perms['create:Entry'] = true
        perms['read:Entry'] = true
        perms['update:Entry'] = true
        perms['delete:Entry'] = true
        perms['create:CreditCard'] = true
        perms['read:CreditCard'] = true
        perms['update:CreditCard'] = true
        perms['delete:CreditCard'] = true
        perms['manage:UserPreferences'] = true
        perms['read:User'] = true
        perms['update:User'] = true
        perms['delete:User'] = true
        perms['read:AdvancedReports'] = true
        perms['create:Export'] = true
        break

      case 'PREMIUM':
        // Usuários premium
        perms['create:Account'] = true
        perms['read:Account'] = true
        perms['update:Account'] = true
        perms['delete:Account'] = true
        perms['create:Category'] = true
        perms['read:Category'] = true
        perms['update:Category'] = true
        perms['delete:Category'] = true
        perms['create:Entry'] = true
        perms['read:Entry'] = true
        perms['update:Entry'] = true
        perms['delete:Entry'] = true
        perms['create:CreditCard'] = true
        perms['read:CreditCard'] = true
        perms['update:CreditCard'] = true
        perms['delete:CreditCard'] = true
        perms['manage:UserPreferences'] = true
        perms['read:User'] = true
        perms['update:User'] = true
        perms['read:AdvancedReports'] = true
        perms['create:Export'] = true
        break

      case 'USER':
      default:
        // Usuários básicos
        perms['create:Account'] = true
        perms['read:Account'] = true
        perms['update:Account'] = true
        perms['delete:Account'] = true
        perms['create:Category'] = true
        perms['read:Category'] = true
        perms['update:Category'] = true
        perms['delete:Category'] = true
        perms['create:Entry'] = true
        perms['read:Entry'] = true
        perms['update:Entry'] = true
        perms['delete:Entry'] = true
        perms['create:CreditCard'] = true
        perms['read:CreditCard'] = true
        perms['update:CreditCard'] = true
        perms['delete:CreditCard'] = true
        perms['manage:UserPreferences'] = true
        perms['read:User'] = true
        perms['update:User'] = true
        break
    }

    return perms
  }, [isAuthenticated, user])

  const can = (action: Actions, subject: Subjects) => {
    const key = `${action}:${subject}`
    return permissions[key] || false
  }

  const cannot = (action: Actions, subject: Subjects) => {
    return !can(action, subject)
  }

  return (
    <PermissionsContext.Provider value={{ permissions, can, cannot }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}

// Hook para verificar permissões específicas
export function usePermission() {
  const { can, cannot } = usePermissions()
  
  return { can, cannot }
}

// Hook para verificar se o usuário tem papel específico
export function useRole() {
  const { user } = useAuthContext()
  
  return {
    hasRole: (roles: string | string[]) => {
      if (!user?.role) return false
      const allowedRoles = Array.isArray(roles) ? roles : [roles]
      return allowedRoles.includes(user.role)
    },
    isAdmin: () => user?.role === 'ADMIN',
    isPremium: () => user?.role === 'PREMIUM',
    isUser: () => user?.role === 'USER',
    getCurrentRole: () => user?.role || 'USER'
  }
}

// Exportar tipos
export type { Actions, Subjects }