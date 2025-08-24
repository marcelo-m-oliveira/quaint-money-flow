import { env } from '@saas/env'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    avatarUrl?: string | null
  }
  metadata?: {
    isNewUser?: boolean
    needsPasswordSetup?: boolean
    hasGoogleProvider?: boolean
  }
}

export interface SetupPasswordData {
  password: string
  confirmPassword: string
}

class AuthService {
  private baseURL = env.NEXT_PUBLIC_API_URL

  private saveTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      // Salvar no localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      // Salvar em cookies para o middleware
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      // Limpar localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')

      // Limpar cookies
      document.cookie =
        'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData?.message || errorData?.error || 'Erro no login'
      throw new Error(message)
    }

    const data = await response.json()
    this.saveTokens(data.accessToken, data.refreshToken)
    return data
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message =
        errorData?.message || errorData?.error || 'Erro no registro'
      throw new Error(message)
    }

    const responseData = await response.json()
    this.saveTokens(responseData.accessToken, responseData.refreshToken)
    return responseData
  }

  async googleLogin(code: string): Promise<AuthResponse> {
    const response = await fetch(
      `${this.baseURL}/auth/google/callback?code=${encodeURIComponent(code)}`,
      {
        method: 'GET',
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message =
        errorData?.message || errorData?.error || 'Erro no login com Google'
      throw new Error(message)
    }

    const data = await response.json()
    this.saveTokens(data.accessToken, data.refreshToken)
    return data
  }

  async setupPassword(
    data: SetupPasswordData,
  ): Promise<{ message: string; user: any }> {
    const accessToken =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')

    if (!accessToken) {
      throw new Error('Token de acesso não encontrado')
    }

    const response = await fetch(`${this.baseURL}/auth/setup-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message =
        errorData?.message || errorData?.error || 'Erro ao configurar senha'
      throw new Error(message)
    }

    return await response.json()
  }

  async logout(): Promise<void> {
    const refreshToken =
      localStorage.getItem('refreshToken') ||
      sessionStorage.getItem('refreshToken')

    if (refreshToken) {
      try {
        const response = await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        })

        if (!response.ok) {
          console.warn(
            'Logout no servidor falhou, mas tokens locais serão limpos',
            {
              status: response.status,
              statusText: response.statusText,
            },
          )
        }
      } catch (error) {
        console.warn(
          'Erro ao fazer logout no servidor, mas tokens locais serão limpos:',
          error,
        )
        // Não falhar o logout local mesmo se o servidor não responder
      }
    }

    // Sempre limpar tokens locais, independente da resposta do servidor
    this.clearTokens()
  }

  async refreshTokens(): Promise<AuthResponse> {
    const refreshToken =
      localStorage.getItem('refreshToken') ||
      sessionStorage.getItem('refreshToken')

    if (!refreshToken) {
      throw new Error('Refresh token não encontrado')
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      this.clearTokens()
      throw new Error('Falha ao renovar tokens')
    }

    const data = await response.json()
    this.saveTokens(data.accessToken, data.refreshToken)
    return data
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken')
      )
    }
    return null
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  async getGoogleAuthUrl(): Promise<string> {
    try {
      const response = await fetch('/api/auth/google/url')

      if (!response.ok) {
        throw new Error('Failed to get Google OAuth URL')
      }

      const data = await response.json()
      return data.authUrl
    } catch (error) {
      console.error('Error getting Google OAuth URL:', error)
      throw new Error('Failed to get Google OAuth URL')
    }
  }
}

export const authService = new AuthService()
