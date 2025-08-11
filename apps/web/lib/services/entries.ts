import { dateToSeconds } from '@saas/utils'

import { apiClient } from '@/lib/api'
import type {
  EntriesQueryParams,
  EntriesResponse,
  Entry,
  EntryFormData,
} from '@/lib/types'

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
    return await apiClient.get<EntriesResponse>(endpoint)
  },

  // Buscar lançamento por ID
  async getById(id: string): Promise<Entry> {
    return await apiClient.get<Entry>(`/entries/${id}`)
  },

  // Criar novo lançamento
  async create(data: EntryFormData): Promise<Entry> {
    // Convert date string to seconds for API
    const processedData = {
      ...data,
      date: dateToSeconds(new Date(data.date)),
    }
    return await apiClient.post<Entry>('/entries', processedData)
  },

  // Atualizar lançamento
  async update(id: string, data: Partial<EntryFormData>): Promise<Entry> {
    // Convert date string to seconds for API if date is provided
    const processedData = {
      ...data,
      ...(data.date && { date: dateToSeconds(new Date(data.date)) }),
    }
    return await apiClient.put<Entry>(`/entries/${id}`, processedData)
  },

  // Deletar lançamento
  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/entries/${id}`)
  },
}
