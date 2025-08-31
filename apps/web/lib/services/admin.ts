import { apiClient } from '@/lib'

// Tipos para admin
export interface AdminUser {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  role: 'user' | 'admin'
  plan?: {
    id: string
    name: string
    type: string
    price: number
  } | null
  createdAt: number
  _count?: {
    accounts: number
    categories: number
    creditCards: number
    entries: number
  }
}

export interface AdminPlan {
  id: string
  name: string
  type: 'free' | 'monthly' | 'annual'
  price: number
  description?: string
  features: any
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface AdminCoupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses?: number | null
  currentUses: number
  expiresAt?: number | null
  isActive: boolean
  createdAt: number
  _count?: {
    userCoupons: number
  }
}

export interface AdminAnalytics {
  users: {
    total: number
    active: number
    newThisMonth: number
    growth: number
  }
  revenue: {
    total: number
    thisMonth: number
    growth: number
  }
  plans: {
    total: number
    active: number
    distribution: Array<{
      name: string
      count: number
      percentage: number
    }>
  }
  usage: {
    totalEntries: number
    totalAccounts: number
    totalCategories: number
    totalCreditCards: number
  }
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: number
    user: string
  }>
}

// Serviço de usuários admin
export const adminUsersService = {
  async getAll(): Promise<{ users: AdminUser[] }> {
    return apiClient.get<{ users: AdminUser[] }>('/admin/users')
  },

  async getById(id: string): Promise<AdminUser> {
    return apiClient.get<AdminUser>(`/admin/users/${id}`)
  },

  async create(data: Partial<AdminUser>): Promise<AdminUser> {
    return apiClient.post<AdminUser>('/admin/users', data)
  },

  async update(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    return apiClient.put<AdminUser>(`/admin/users/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/users/${id}`)
  },

  async changePassword(id: string, password: string): Promise<void> {
    return apiClient.patch<void>(`/admin/users/${id}/password`, { password })
  },

  async changePlan(id: string, planId: string): Promise<void> {
    return apiClient.patch<void>(`/admin/users/${id}/plan`, { planId })
  },
}

// Serviço de planos admin
export const adminPlansService = {
  async getAll(includeInactive = false): Promise<{ plans: AdminPlan[] }> {
    const params = new URLSearchParams()
    if (includeInactive) {
      params.append('includeInactive', 'true')
    }
    return apiClient.get<{ plans: AdminPlan[] }>(`/admin/plans?${params}`)
  },

  async getById(id: string): Promise<AdminPlan> {
    return apiClient.get<AdminPlan>(`/admin/plans/${id}`)
  },

  async create(data: Partial<AdminPlan>): Promise<AdminPlan> {
    return apiClient.post<AdminPlan>('/admin/plans', data)
  },

  async update(id: string, data: Partial<AdminPlan>): Promise<AdminPlan> {
    return apiClient.put<AdminPlan>(`/admin/plans/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/plans/${id}`)
  },

  async activate(id: string): Promise<AdminPlan> {
    return apiClient.patch<AdminPlan>(`/admin/plans/${id}/activate`)
  },

  async deactivate(id: string): Promise<AdminPlan> {
    return apiClient.patch<AdminPlan>(`/admin/plans/${id}/deactivate`)
  },

  async getStats(): Promise<any> {
    return apiClient.get<any>('/admin/plans/stats')
  },
}

// Serviço de cupons admin
export const adminCouponsService = {
  async getAll(includeUsage = false): Promise<{ coupons: AdminCoupon[] }> {
    const params = new URLSearchParams()
    if (includeUsage) {
      params.append('includeUsage', 'true')
    }
    return apiClient.get<{ coupons: AdminCoupon[] }>(`/admin/coupons?${params}`)
  },

  async getById(id: string): Promise<AdminCoupon> {
    return apiClient.get<AdminCoupon>(`/admin/coupons/${id}`)
  },

  async create(data: Partial<AdminCoupon>): Promise<AdminCoupon> {
    return apiClient.post<AdminCoupon>('/admin/coupons', data)
  },

  async update(id: string, data: Partial<AdminCoupon>): Promise<AdminCoupon> {
    return apiClient.put<AdminCoupon>(`/admin/coupons/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/coupons/${id}`)
  },

  async activate(id: string): Promise<AdminCoupon> {
    return apiClient.patch<AdminCoupon>(`/admin/coupons/${id}/activate`)
  },

  async deactivate(id: string): Promise<AdminCoupon> {
    return apiClient.patch<AdminCoupon>(`/admin/coupons/${id}/deactivate`)
  },
}

// Serviço de analytics admin
export const adminAnalyticsService = {
  async getAnalytics(timeRange = '30d'): Promise<AdminAnalytics> {
    return apiClient.get<AdminAnalytics>(
      `/admin/analytics?timeRange=${timeRange}`,
    )
  },

  async getDashboardStats(): Promise<any> {
    return apiClient.get<any>('/admin/dashboard/stats')
  },
}
