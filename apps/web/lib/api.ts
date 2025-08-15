import { env } from '@saas/env'

import type { ApiResponse, PaginatedResponse } from './types'

const API_BASE_URL = env.NEXT_PUBLIC_API_URL

export type { ApiResponse, PaginatedResponse }

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Para desenvolvimento, usar um token fixo
    // Em produção, isso deve vir do contexto de autenticação
    const token = 'dev-token-123'

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        )
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

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Para desenvolvimento, usar um token fixo
    // Em produção, isso deve vir do contexto de autenticação
    const token = 'dev-token-123'

    const config: RequestInit = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        // Não incluir Content-Type para DELETE sem body
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        )
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
