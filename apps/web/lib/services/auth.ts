import { env } from '@saas/env'

import { getCookie, removeCookie, setCookie } from '@/lib/utils/cookies'

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
      // Salvar em cookies
      setCookie('accessToken', accessToken, 7 * 24 * 60 * 60) // 7 dias
      setCookie('refreshToken', refreshToken, 30 * 24 * 60 * 60) // 30 dias
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      // Limpar cookies
      removeCookie('accessToken')
      removeCookie('refreshToken')
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
    const accessToken = getCookie('accessToken')

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
    const refreshToken = getCookie('refreshToken')

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
    const refreshToken = getCookie('refreshToken')

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
      return getCookie('accessToken')
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

  async openGoogleAuthPopup(): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      try {
        // Obter a URL do Google OAuth
        this.getGoogleAuthUrl()
          .then((authUrl) => {
            // Configurar a popup
            const popupWidth = 500
            const popupHeight = 600
            const left = window.screenX + (window.outerWidth - popupWidth) / 2
            const top = window.screenY + (window.outerHeight - popupHeight) / 2

            const popup = window.open(
              authUrl,
              'googleAuth',
              `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`,
            )

            if (!popup) {
              reject(
                new Error(
                  'Popup bloqueada pelo navegador. Permita popups para este site.',
                ),
              )
              return
            }

            // Monitorar a popup
            const checkClosed = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkClosed)
                reject(new Error('Autenticação cancelada pelo usuário'))
              }
            }, 1000)

            // Listener para mensagens da popup
            const messageListener = (event: MessageEvent) => {
              // Verificar se a mensagem é da nossa popup
              if (event.origin !== window.location.origin) {
                return
              }

              if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                clearInterval(checkClosed)
                window.removeEventListener('message', messageListener)
                popup.close()

                // Processar o código de autorização
                this.googleLogin(event.data.code).then(resolve).catch(reject)
              } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                clearInterval(checkClosed)
                window.removeEventListener('message', messageListener)
                popup.close()
                reject(
                  new Error(
                    event.data.error || 'Erro na autenticação com Google',
                  ),
                )
              }
            }

            window.addEventListener('message', messageListener)
          })
          .catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  }
}

export const authService = new AuthService()
