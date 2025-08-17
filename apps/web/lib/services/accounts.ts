import type {
  Account,
  AccountFormData,
  AccountsQueryParams,
  AccountsResponse,
  SelectOption,
} from '@/lib'
import { apiClient } from '@/lib'

export const accountsService = {
  async getAll(params?: AccountsQueryParams): Promise<AccountsResponse> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.type) searchParams.append('type', params.type)

    const queryString = searchParams.toString()
    const endpoint = `/accounts${queryString ? `?${queryString}` : ''}`

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
