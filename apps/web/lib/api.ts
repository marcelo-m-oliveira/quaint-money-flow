import { env } from '@saas/env'

import type { ApiResponse, PaginatedResponse } from './types'
import { getCookie, removeCookie, setCookie } from './utils/cookies'

// Chamadas diretas para a API backend
const API_BASE_URL = env.NEXT_PUBLIC_API_URL

export type { ApiResponse, PaginatedResponse }

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthToken(): Promise<string | null> {
    // Em ambiente cliente, buscar token dos cookies
    if (typeof window !== 'undefined') {
      return getCookie('accessToken')
    }
    return null
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = getCookie('refreshToken')
      if (!refreshToken) return null

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        // Se o refresh falhou, limpar tokens e redirecionar para login
        removeCookie('accessToken')
        removeCookie('refreshToken')
        if (typeof window !== 'undefined') {
          window.location.href = '/signin'
        }
        return null
      }

      const data = await response.json()

      // Salvar novos tokens nos cookies
      setCookie('accessToken', data.accessToken, 7 * 24 * 60 * 60) // 7 dias
      setCookie('refreshToken', data.refreshToken, 30 * 24 * 60 * 60) // 30 dias

      return data.accessToken
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      return null
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Obter token de autenticação
    const accessToken = await this.getAuthToken()

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Adicionar token de autenticação se disponível
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }

    try {
      const response = await fetch(url, config)

      // Se receber 401, tentar renovar o token
      if (response.status === 401 && accessToken) {
        const newToken = await this.refreshToken()
        if (newToken) {
          // Refazer a requisição com o novo token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          }
          const retryResponse = await fetch(url, config)

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}))
            const message = errorData && (errorData.message || errorData.error)
            throw new Error(
              message || `HTTP error! status: ${retryResponse.status}`,
            )
          }

          return await retryResponse.json()
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData && (errorData.message || errorData.error)
        throw new Error(message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const accessToken = await this.getAuthToken()
    const config: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    }

    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData && (errorData.message || errorData.error)
        throw new Error(message || `HTTP error! status: ${response.status}`)
      }

      // Para PUT que retorna 204 No Content, não tentar fazer parse do JSON
      if (response.status === 204) {
        return undefined as T
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const accessToken = await this.getAuthToken()
    const config: RequestInit = {
      method: 'DELETE',
      headers: {
        // Não incluir Content-Type para DELETE sem body
      },
    }

    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData && (errorData.message || errorData.error)
        throw new Error(message || `HTTP error! status: ${response.status}`)
      }

      // Para DELETE que retorna 204 No Content, não tentar fazer parse do JSON
      if (response.status === 204) {
        return undefined as T
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Export como 'api' para compatibilidade
export const api = apiClient