'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AppAbility, defineAbilityFor, UserWithPlan } from '@/lib/casl'
import { createContextualCan } from '@casl/react'
import { useAuth } from '@/lib/hooks/use-auth'
import { api } from '@/lib/api'

interface PermissionsContextType {
  ability: AppAbility
  user: UserWithPlan | null
  updateUser: (user: UserWithPlan) => void
  Can: ReturnType<typeof createContextualCan>
  isLoading: boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ 
  children,
}: { 
  children: React.ReactNode
}) {
  const { user: authUser, isAuthenticated } = useAuth()
  const [user, setUser] = useState<UserWithPlan | null>(null)
  const [ability, setAbility] = useState<AppAbility>(() => defineAbilityFor(null))
  const [isLoading, setIsLoading] = useState(false)

  // Criar o componente Can contextual
  const Can = createContextualCan(PermissionsContext.Consumer)

  const updateUser = (newUser: UserWithPlan) => {
    setUser(newUser)
    setAbility(defineAbilityFor(newUser))
  }



  // Buscar dados completos do usuário quando autenticado
  useEffect(() => {
    const fetchUserWithPlan = async () => {
      if (!authUser || !isAuthenticated) {
        setUser(null)
        setAbility(defineAbilityFor(null))
        return
      }

      try {
        setIsLoading(true)
        
        // Verificar se api está disponível
        if (!api || typeof api.get !== 'function') {
          throw new Error('API client não disponível')
        }
        
        // Buscar dados completos do usuário incluindo plano
        const userResponse = await api.get('/users/me')
        
        // Transformar para o formato esperado pelo CASL
        const userWithPlan: UserWithPlan = {
          id: userResponse.id,
          email: userResponse.email,
          name: userResponse.name,
          role: userResponse.role || 'user',
          plan: userResponse.plan || null,
        }

        setUser(userWithPlan)
        setAbility(defineAbilityFor(userWithPlan))
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        // Fallback com dados básicos do auth
        const basicUser: UserWithPlan = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          role: authUser.role || 'user', // Usar role do auth se disponível
          plan: null,
        }
        setUser(basicUser)
        setAbility(defineAbilityFor(basicUser))
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserWithPlan()
  }, [authUser, isAuthenticated, authUser?.role, authUser?.id])

  // Limpar permissões quando não autenticado
  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      setUser(null)
      setAbility(defineAbilityFor(null))
    }
  }, [isAuthenticated, authUser])



  // Escutar eventos de mudança de autenticação
  useEffect(() => {
    const handleAuthChange = () => {
      if (authUser && isAuthenticated) {
        // Forçar nova busca dos dados do usuário
        const fetchUserWithPlan = async () => {
          try {
            setIsLoading(true)
            
            if (!api || typeof api.get !== 'function') {
              throw new Error('API client não disponível')
            }
            
            const userResponse = await api.get('/users/me')
            
            const userWithPlan: UserWithPlan = {
              id: userResponse.id,
              email: userResponse.email,
              name: userResponse.name,
              role: userResponse.role || 'user',
              plan: userResponse.plan || null,
            }

            setUser(userWithPlan)
            setAbility(defineAbilityFor(userWithPlan))
          } catch (error) {
            console.error('Erro ao atualizar permissões:', error)
            const basicUser: UserWithPlan = {
              id: authUser.id,
              email: authUser.email,
              name: authUser.name,
              role: authUser.role || 'user',
              plan: null,
            }
            setUser(basicUser)
            setAbility(defineAbilityFor(basicUser))
          } finally {
            setIsLoading(false)
          }
        }
        
        fetchUserWithPlan()
      } else {
        setUser(null)
        setAbility(defineAbilityFor(null))
      }
    }

    // Adicionar listener para eventos de mudança de auth
    window.addEventListener('auth:changed', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth:changed', handleAuthChange)
    }
  }, [authUser, isAuthenticated])

  return (
    <PermissionsContext.Provider value={{ 
      ability, 
      user, 
      updateUser,
      Can,
      isLoading,
    }}>
      {children}
    </PermissionsContext.Provider>
  )
}

// Hook personalizado para usar as permissões
export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}

// Hook para verificar uma permissão específica
export function useAbility() {
  const { ability } = usePermissions()
  return ability
}

// Hook para verificar se pode executar uma ação
export function useCan(action: string, subject: string) {
  const ability = useAbility()
  return ability.can(action, subject)
}

// Hook para obter informações do usuário e plano
export function useUser() {
  const { user, updateUser } = usePermissions()
  return { user, updateUser }
}
