import { dateToSeconds } from '@saas/utils'

import { apiClient } from '@/lib/api'
import type {
  EntriesQueryParams,
  EntriesResponse,
  Entry,
  EntryFormData,
} from '@/lib/types'

// Helper function to convert API response to proper types
function convertEntryFromApi(
  entry: Entry & { amount: string | number },
): Entry {
  return {
    ...entry,
    amount: entry.amount,
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

    // Adicionar cache-busting para forçar nova requisição
    queryParams.append('_t', Date.now().toString())

    const endpoint = `/entries?${queryParams.toString()}`
    const response = await apiClient.get<EntriesResponse>(endpoint)

    // Convert entries to proper types
    return {
      ...response,
      entries: response.entries.map(convertEntryFromApi),
    }
  },

  // Buscar lançamento por ID
  async getById(id: string): Promise<Entry> {
    const entry = await apiClient.get<Entry>(`/entries/${id}`)
    return convertEntryFromApi(entry)
  },

  // Criar novo lançamento
  async create(data: EntryFormData): Promise<Entry> {
    // Convert date string to seconds for API
    const processedData = {
      ...data,
      date: dateToSeconds(new Date(data.date)),
    }
    const entry = await apiClient.post<Entry>('/entries', processedData)
    return convertEntryFromApi(entry)
  },

  // Atualizar lançamento
  async update(id: string, data: Partial<EntryFormData>): Promise<Entry> {
    // Convert date string to seconds for API if date is provided
    const processedData = {
      ...data,
      ...(data.date && { date: dateToSeconds(new Date(data.date)) }),
    }
    const entry = await apiClient.put<Entry>(`/entries/${id}`, processedData)
    return convertEntryFromApi(entry)
  },

  // Deletar lançamento
  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/entries/${id}`)
  },
}
