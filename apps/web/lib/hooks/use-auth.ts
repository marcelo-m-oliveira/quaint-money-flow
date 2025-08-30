'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import {
  authService,
  type LoginCredentials,
  type RegisterData,
  type SetupPasswordData,
} from '@/lib/services/auth'

interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  role?: string
}

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  googleLogin: (code: string) => Promise<void>
  googleLoginPopup: (authResponse: any) => Promise<void>
  setupPassword: (data: SetupPasswordData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = authService.isAuthenticated()

  const refreshUser = useCallback(async () => {
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        setUser(null)
        return
      }

      // Buscar dados do usuário da API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Se não conseguir buscar dados do usuário, tentar renovar token
        try {
          const authResponse = await authService.refreshTokens()
          setUser(authResponse.user)
        } catch {
          // Se renovar falhar, limpar usuário
          setUser(null)
          authService.logout()
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true)
        const response = await authService.login(credentials)
        setUser(response.user)

        // Disparar evento de mudança de autenticação
        window.dispatchEvent(new CustomEvent('auth:changed'))

        // Aguardar um pouco para garantir que o contexto de permissões seja atualizado
        setTimeout(() => {
          router.push('/')
        }, 200)
      } catch (error) {
        console.error('Erro no login:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true)
        const response = await authService.register(data)
        setUser(response.user)
        // Removido o redirecionamento automático para permitir que a página controle o fluxo
        // router.push('/')
      } catch (error) {
        console.error('Erro no registro:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const googleLogin = useCallback(
    async (code: string) => {
      try {
        setIsLoading(true)
        const response = await authService.googleLogin(code)
        setUser(response.user)

        // Verificar se precisa configurar senha
        if (response.metadata?.needsPasswordSetup) {
          router.push('/auth/setup-password')
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Erro no login com Google:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const googleLoginPopup = useCallback(
    async (authResponse: any) => {
      try {
        setIsLoading(true)
        setUser(authResponse.user)

        // Verificar se precisa configurar senha
        if (authResponse.metadata?.needsPasswordSetup) {
          router.push('/auth/setup-password')
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Erro no login com Google via popup:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const setupPassword = useCallback(
    async (data: SetupPasswordData) => {
      try {
        setIsLoading(true)
        await authService.setupPassword(data)
        router.push('/')
      } catch (error) {
        console.error('Erro ao configurar senha:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)

      // Disparar evento de mudança de autenticação
      window.dispatchEvent(new CustomEvent('auth:changed'))

      router.push('/signin')
    } catch (error) {
      console.error('Erro no logout:', error)
      // Mesmo com erro, limpar estado local
      setUser(null)

      // Disparar evento de mudança de autenticação
      window.dispatchEvent(new CustomEvent('auth:changed'))

      router.push('/signin')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Inicializar usuário quando o hook é montado
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    googleLogin,
    googleLoginPopup,
    setupPassword,
    logout,
    refreshUser,
  }
}
