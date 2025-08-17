import type {
  CreditCard,
  CreditCardsQueryParams,
  CreditCardsResponse,
  SelectOption,
} from '@/lib'
import { apiClient } from '@/lib'
import { buildQuery } from '@/lib/utils'

import { CreditCardFormSchema } from '../schemas'

export const creditCardsService = {
  async getAll(params?: CreditCardsQueryParams): Promise<CreditCardsResponse> {
    const qs = buildQuery({
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
    })
    const endpoint = `/credit-cards${qs}`
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
