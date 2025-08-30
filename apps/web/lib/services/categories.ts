import { api, PaginatedResponse } from '@/lib/api'
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
    return api.get<PaginatedResponse<Category>>(endpoint)
  },

  async getById(id: string): Promise<Category> {
    return api.get<Category>(`/categories/${id}`)
  },

  async create(data: CategoryFormData): Promise<Category> {
    return api.post<Category>('/categories', data)
  },

  async update(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    return api.put<Category>(`/categories/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/categories/${id}`)
  },

  async getSelectOptions(type?: 'income' | 'expense'): Promise<SelectOption[]> {
    const qs = buildQuery({ type })
    const endpoint = `/categories/select-options${qs}`
    return api.get<SelectOption[]>(endpoint)
  },

  async getUsageStats(): Promise<CategoryUsage[]> {
    return api.get<CategoryUsage[]>('/categories/usage')
  },
}
