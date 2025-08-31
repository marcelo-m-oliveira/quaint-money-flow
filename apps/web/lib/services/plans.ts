import { api } from '@/lib/api'

export interface Plan {
  id: string
  name: string
  type: 'free' | 'monthly' | 'annual'
  price: number
  description?: string
  features: {
    entries?: { unlimited: boolean }
    categories?: { unlimited: boolean; limited?: boolean; max?: number }
    accounts?: { unlimited: boolean; limited?: boolean; max?: number }
    creditCards?: { unlimited: boolean; limited?: boolean; max?: number }
    reports?: { basic?: boolean; advanced?: boolean }
    discount?: number
  }
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface PlanFormData {
  name: string
  type: 'free' | 'monthly' | 'annual'
  price: number
  description?: string
  features: any
  isActive?: boolean
}

export interface PlanStats {
  totalPlans: number
  activePlans: number
  planUsage: Array<{
    id: string
    name: string
    type: string
    price: number
    userCount: number
    isActive: boolean
  }>
}

class Plans {
  private baseUrl = '/plans'

  async getAll(includeInactive = false): Promise<{ plans: Plan[] }> {
    const params = new URLSearchParams()
    if (includeInactive) {
      params.append('includeInactive', 'true')
    }

    const response = await api.get(`${this.baseUrl}?${params}`)
    return response
  }

  async getById(id: string): Promise<Plan> {
    return api.get(`${this.baseUrl}/${id}`)
  }

  async create(data: PlanFormData): Promise<Plan> {
    return api.post(this.baseUrl, data)
  }

  async update(id: string, data: Partial<PlanFormData>): Promise<Plan> {
    return api.put(`${this.baseUrl}/${id}`, data)
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`${this.baseUrl}/${id}`)
  }

  async activate(id: string): Promise<Plan> {
    return api.patch(`${this.baseUrl}/${id}/activate`)
  }

  async deactivate(id: string): Promise<Plan> {
    return api.patch(`${this.baseUrl}/${id}/deactivate`)
  }

  async getStats(): Promise<PlanStats> {
    return api.get('/admin/plans/stats')
  }

  // Helpers para definições de planos
  static getDefaultPlans() {
    return {
      free: {
        name: 'Plano Free',
        type: 'free' as const,
        price: 0,
        description: 'Plano gratuito com funcionalidades básicas',
        features: {
          entries: { unlimited: true },
          categories: { limited: true, max: 10 },
          accounts: { limited: true, max: 1 },
          creditCards: { limited: true, max: 2 },
          reports: { basic: true },
        },
      },
      monthly: {
        name: 'Plano Mensal',
        type: 'monthly' as const,
        price: 19.9,
        description: 'Plano mensal com todas as funcionalidades',
        features: {
          entries: { unlimited: true },
          categories: { unlimited: true },
          accounts: { unlimited: true },
          creditCards: { unlimited: true },
          reports: { advanced: true },
        },
      },
      annual: {
        name: 'Plano Anual',
        type: 'annual' as const,
        price: 203.15, // 15% de desconto
        description:
          'Plano anual com 15% de desconto e todas as funcionalidades',
        features: {
          entries: { unlimited: true },
          categories: { unlimited: true },
          accounts: { unlimited: true },
          creditCards: { unlimited: true },
          reports: { advanced: true },
          discount: 15,
        },
      },
    }
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  static getPlanBadgeColor(type: Plan['type']): string {
    switch (type) {
      case 'free':
        return 'bg-gray-100 text-gray-800'
      case 'monthly':
        return 'bg-blue-100 text-blue-800'
      case 'annual':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  static getPlanTypeLabel(type: Plan['type']): string {
    switch (type) {
      case 'free':
        return 'Gratuito'
      case 'monthly':
        return 'Mensal'
      case 'annual':
        return 'Anual'
      default:
        return 'Desconhecido'
    }
  }
}

export const plansService = new Plans()
export { Plans }
