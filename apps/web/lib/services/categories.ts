import { apiClient } from '@/lib/api'

export interface Category {
  id: string
  name: string
  color: string
  type: 'income' | 'expense'
  icon: string
  parentId?: string
  createdAt: number
  updatedAt: number
  parent?: {
    id: string
    name: string
    color: string
    icon: string
  }
  children?: Array<{
    id: string
    name: string
    color: string
    icon: string
    type: 'income' | 'expense'
  }>
}

export interface CategoryFormData {
  name: string
  color: string
  type: 'income' | 'expense'
  icon: string
  parentId?: string
}

export interface CategoriesQueryParams {
  page?: number
  limit?: number
  type?: 'income' | 'expense'
  search?: string
  parentId?: string
}

export interface CategoriesResponse {
  categories: Category[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SelectOption {
  value: string
  label: string
  icon: string
  iconType: string
}

export interface CategoryUsage {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense'
  transactionCount: number
  totalAmount: number
}

export const categoriesService = {
  async getAll(params?: CategoriesQueryParams): Promise<CategoriesResponse> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.type) searchParams.append('type', params.type)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.parentId) searchParams.append('parentId', params.parentId)

    const queryString = searchParams.toString()
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`

    return apiClient.get<CategoriesResponse>(endpoint)
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
    const searchParams = new URLSearchParams()
    if (type) searchParams.append('type', type)

    const queryString = searchParams.toString()
    const endpoint = `/categories/select${queryString ? `?${queryString}` : ''}`

    return apiClient.get<SelectOption[]>(endpoint)
  },

  async getUsageStats(): Promise<CategoryUsage[]> {
    return apiClient.get<CategoryUsage[]>('/categories/usage')
  },
}
