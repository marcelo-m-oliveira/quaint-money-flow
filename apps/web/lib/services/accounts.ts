import type {
  Account,
  AccountFormData,
  AccountsQueryParams,
  AccountsResponse,
  SelectOption,
} from '@/lib'
import { apiClient } from '@/lib'
import { buildQuery } from '@/lib/utils'

export const accountsService = {
  async getAll(params?: AccountsQueryParams): Promise<AccountsResponse> {
    const qs = buildQuery({
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      type: params?.type,
    })
    const endpoint = `/accounts${qs}`
    return apiClient.get<AccountsResponse>(endpoint)
  },

  async getSelectOptions(): Promise<SelectOption[]> {
    return apiClient.get<SelectOption[]>('/accounts/select-options')
  },

  async getById(id: string): Promise<Account> {
    return apiClient.get<Account>(`/accounts/${id}`)
  },

  async create(data: AccountFormData): Promise<Account> {
    return apiClient.post<Account>('/accounts', data)
  },

  async update(id: string, data: Partial<AccountFormData>): Promise<Account> {
    return apiClient.put<Account>(`/accounts/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/accounts/${id}`)
  },
}
