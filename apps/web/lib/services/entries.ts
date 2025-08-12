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
    // Convert date string to seconds for API and ensure required fields are present
    const processedData = {
      description: data.description,
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId,
      date: dateToSeconds(new Date(data.date)),
      paid: data.paid ?? false, // Ensure paid is always a boolean
      // Only include optional fields if they have values
      ...(data.accountId && { accountId: data.accountId }),
      ...(data.creditCardId && { creditCardId: data.creditCardId }),
    }
    const entry = await apiClient.post<Entry>('/entries', processedData)
    return convertEntryFromApi(entry)
  },

  // Atualizar lançamento
  async update(id: string, data: Partial<EntryFormData>): Promise<Entry> {
    // Convert date string to seconds for API if date is provided and ensure proper field handling
    const processedData: Record<string, string | number | boolean> = {}

    // Only include fields that are explicitly provided
    if (data.description !== undefined)
      processedData.description = data.description
    if (data.amount !== undefined) processedData.amount = data.amount
    if (data.type !== undefined) processedData.type = data.type
    if (data.categoryId !== undefined)
      processedData.categoryId = data.categoryId
    if (data.paid !== undefined) processedData.paid = data.paid
    if (data.date !== undefined)
      processedData.date = dateToSeconds(new Date(data.date))

    // Handle optional fields - only include if they have truthy values
    if (data.accountId) processedData.accountId = data.accountId
    if (data.creditCardId) processedData.creditCardId = data.creditCardId

    const entry = await apiClient.put<Entry>(`/entries/${id}`, processedData)
    return convertEntryFromApi(entry)
  },

  // Atualizar lançamento parcialmente (PATCH)
  async patch(id: string, data: Partial<EntryFormData>): Promise<Entry> {
    // Convert date string to seconds for API if date is provided
    const processedData: Record<string, string | number | boolean> = {}

    // Only include fields that are explicitly provided
    if (data.description !== undefined)
      processedData.description = data.description
    if (data.amount !== undefined) processedData.amount = data.amount
    if (data.type !== undefined) processedData.type = data.type
    if (data.categoryId !== undefined)
      processedData.categoryId = data.categoryId
    if (data.paid !== undefined) processedData.paid = data.paid
    if (data.date !== undefined)
      processedData.date = dateToSeconds(new Date(data.date))

    // Handle optional fields - only include if they have truthy values
    if (data.accountId) processedData.accountId = data.accountId
    if (data.creditCardId) processedData.creditCardId = data.creditCardId

    const entry = await apiClient.patch<Entry>(`/entries/${id}`, processedData)
    return convertEntryFromApi(entry)
  },

  // Deletar lançamento
  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(`/entries/${id}`)
  },
}
