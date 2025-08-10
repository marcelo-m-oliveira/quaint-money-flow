import { apiClient } from '@/lib/api'

// Interfaces
export interface Entry {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  date: number // timestamp em segundos
  paid: boolean
  categoryId: string
  accountId?: string
  creditCardId?: string
  userId: string
  createdAt: number // timestamp em segundos
  updatedAt: number // timestamp em segundos
  category?: {
    id: string
    name: string
    color: string
    icon: string
    type: 'income' | 'expense'
  }
  account?: {
    id: string
    name: string
    icon: string
    iconType: string
  }
  creditCard?: {
    id: string
    name: string
    color: string
    icon: string
    iconType: string
    limit: number
  }
}

export interface EntryFormData {
  description: string
  amount: string
  type: 'income' | 'expense'
  date: string
  paid: boolean
  categoryId: string
  accountId?: string
  creditCardId?: string
}

export interface EntriesQueryParams {
  page?: number
  limit?: number
  type?: 'income' | 'expense'
  categoryId?: string
  accountId?: string
  creditCardId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface EntriesResponse {
  entries: Entry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Service
export const entriesService = {
  // Listar lançamentos com filtros
  async getAll(params?: EntriesQueryParams): Promise<EntriesResponse> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const endpoint = queryParams.toString()
      ? `/entries?${queryParams.toString()}`
      : '/entries'
    const response = await apiClient.get<EntriesResponse>(endpoint)
    return response
  },

  // Buscar lançamento por ID
  async getById(id: string): Promise<Entry> {
    const response = await apiClient.get<Entry>(`/entries/${id}`)
    return response
  },

  // Criar novo lançamento
  async create(data: EntryFormData): Promise<Entry> {
    const response = await apiClient.post<Entry>('/entries', data)
    return response
  },

  // Atualizar lançamento
  async update(id: string, data: Partial<EntryFormData>): Promise<Entry> {
    const response = await apiClient.put<Entry>(`/entries/${id}`, data)
    return response
  },

  // Deletar lançamento
  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/entries/${id}`)
  },
}
