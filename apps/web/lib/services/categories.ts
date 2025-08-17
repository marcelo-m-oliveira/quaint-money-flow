import { apiClient, PaginatedResponse } from '@/lib/api'
import type {
  CategoriesQueryParams,
  Category,
  CategoryFormData,
  CategoryUsage,
  SelectOption,
} from '@/lib/types'
import { buildQuery } from '@/lib/utils'

export const categoriesService = {
  async getAll(
    params?: CategoriesQueryParams,
  ): Promise<PaginatedResponse<Category>> {
    const qs = buildQuery({
      page: params?.page,
      limit: params?.limit,
      type: params?.type,
      search: params?.search,
      parentId: params?.parentId,
    })
    const endpoint = `/categories${qs}`
    return apiClient.get<PaginatedResponse<Category>>(endpoint)
  },

  async getById(id: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${id}`)
  },

  async create(data: CategoryFormData): Promise<Category> {
    return apiClient.post<Category>('/categories', data)
  },

  async update(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    return apiClient.put<Category>(`/categories/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/categories/${id}`)
  },

  async getSelectOptions(type?: 'income' | 'expense'): Promise<SelectOption[]> {
    const qs = buildQuery({ type })
    const endpoint = `/categories/select-options${qs}`
    return apiClient.get<SelectOption[]>(endpoint)
  },

  async getUsageStats(): Promise<CategoryUsage[]> {
    return apiClient.get<CategoryUsage[]>('/categories/usage')
  },
}
