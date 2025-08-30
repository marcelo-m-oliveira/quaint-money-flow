import { api } from '@/lib/api'

export interface UserAbilities {
  role: string
  planId: string | null
  abilities: Record<string, boolean>
  limits: Record<string, any> | null
}

export interface PlanLimits {
  allowed: boolean
  limit?: number
  current?: number
  remaining?: number
}

export interface UserInfo {
  id: string
  email: string
  name: string
  role: string
  planId: string | null
  createdAt: number
  updatedAt: number
}

export interface UsersListResponse {
  users: UserInfo[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export class PermissionsService {
  // Buscar habilidades do usuário atual
  static async getMyAbilities(): Promise<UserAbilities> {
    const response = await api.get('/permissions/my-abilities')
    return (response as any).data
  }

  // Verificar limites do plano para um recurso específico
  static async checkPlanLimits(resource: 'accounts' | 'categories' | 'creditCards'): Promise<PlanLimits> {
    const response = await api.get(`/permissions/check-limits/${resource}`)
    return (response as any).data
  }

  // Alterar papel de um usuário (apenas admins)
  static async changeUserRole(userId: string, role: 'USER' | 'PREMIUM' | 'ADMIN'): Promise<{
    message: string
    user: UserInfo
  }> {
    const response = await api.put(`/permissions/users/${userId}/role`, { role })
    return (response as any).data
  }

  // Listar todos os usuários (apenas admins)
  static async listUsers(params: {
    page?: number
    limit?: number
    search?: string
    role?: 'USER' | 'PREMIUM' | 'ADMIN'
  } = {}): Promise<UsersListResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.search) searchParams.append('search', params.search)
    if (params.role) searchParams.append('role', params.role)

    const response = await api.get(`/permissions/users?${searchParams.toString()}`)
    return (response as any).data
  }

  // Verificar se o usuário pode executar uma ação
  static async canUserPerform(action: string, subject: string): Promise<boolean> {
    try {
      const abilities = await this.getMyAbilities()
      const key = `${action}:${subject}`
      return abilities.abilities[key] || false
    } catch {
      return false
    }
  }
}