import type { ApiResponse, PaginatedResponse } from './types'

// Use internal proxy so that cookies/session are available and we can inject auth
const API_BASE_URL = '/api/proxy'

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

    // Read access token from NextAuth session (server or client-safe header injection)
    // Token is injected by proxy route; no need to read here

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

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

    const config: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
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

    const config: RequestInit = {
      method: 'DELETE',
      headers: {
        // Não incluir Content-Type para DELETE sem body
      },
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
