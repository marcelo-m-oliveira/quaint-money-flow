import { apiClient } from '../api'
import { CreditCardFormSchema } from '../schemas'
import { CreditCard } from '../types'

export interface SelectOption {
  value: string
  label: string
  icon: string
  iconType: 'bank' | 'generic'
}

export interface CreditCardsQueryParams {
  page?: number
  limit?: number
  search?: string
}

export interface CreditCardsResponse {
  creditCards: CreditCard[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const creditCardsService = {
  async getAll(params?: CreditCardsQueryParams): Promise<CreditCardsResponse> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)

    const queryString = searchParams.toString()
    const endpoint = `/credit-cards${queryString ? `?${queryString}` : ''}`

    return apiClient.get<CreditCardsResponse>(endpoint)
  },

  async getById(id: string): Promise<CreditCard> {
    return apiClient.get<CreditCard>(`/credit-cards/${id}`)
  },

  async create(data: CreditCardFormSchema): Promise<CreditCard> {
    return apiClient.post<CreditCard>('/credit-cards', data)
  },

  async update(
    id: string,
    data: Partial<CreditCardFormSchema>,
  ): Promise<CreditCard> {
    return apiClient.put<CreditCard>(`/credit-cards/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/credit-cards/${id}`)
  },

  async getSelectOptions(): Promise<SelectOption[]> {
    return apiClient.get<SelectOption[]>('/credit-cards/select-options')
  },
}
