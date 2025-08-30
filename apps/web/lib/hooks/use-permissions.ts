import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { api } from '@/lib/api'
import { useAuthContext } from '@/lib/contexts/auth-context'

interface UserAbilities {
  role: string
  planId: string | null
  abilities: Record<string, boolean>
  limits: Record<string, any> | null
}

interface PlanLimits {
  allowed: boolean
  limit?: number
  current?: number
  remaining?: number
}

export function useUserAbilities() {
  const { isAuthenticated, isLoading } = useAuthContext()

  const { data, error, isLoading: isLoadingAbilities, mutate } = useSWR<UserAbilities>(
    isAuthenticated ? '/permissions/my-abilities' : null,
    (url) => api.get(url).then((res: any) => res.data),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      errorRetryCount: 2,
    }
  )

  return {
    abilities: data?.abilities || {},
    role: data?.role || 'USER',
    planId: data?.planId,
    limits: data?.limits,
    isLoading: isLoading || isLoadingAbilities,
    error,
    refetch: mutate,
  }
}

export function usePlanLimits(resource: 'accounts' | 'categories' | 'creditCards') {
  const { isAuthenticated } = useAuthContext()

  const { data, error, isLoading, mutate } = useSWR<PlanLimits>(
    isAuthenticated ? `/permissions/check-limits/${resource}` : null,
    (url) => api.get(url).then((res: any) => res.data),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  return {
    ...data,
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useCanPerform() {
  const { abilities } = useUserAbilities()

  return {
    can: (action: string, subject: string) => {
      const key = `${action}:${subject}`
      return abilities[key] || false
    },
    cannot: (action: string, subject: string) => {
      const key = `${action}:${subject}`
      return !abilities[key]
    }
  }
}

export function useUserRole() {
  const { role } = useUserAbilities()

  return {
    role,
    isAdmin: role === 'ADMIN',
    isPremium: role === 'PREMIUM',
    isUser: role === 'USER',
    getCurrentRole: () => role,
    hasRole: (roles: string | string[]) => {
      const allowedRoles = Array.isArray(roles) ? roles : [roles]
      return allowedRoles.includes(role)
    }
  }
}