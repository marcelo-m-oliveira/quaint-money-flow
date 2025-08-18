import { apiClient } from '@/lib/api'

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', payload)
  },
}
