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

export async function setupPassword(
  password: string,
  confirmPassword: string,
  accessToken: string,
) {
  const response = await fetch('/api/proxy/auth/setup-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      password,
      confirmPassword,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao configurar senha')
  }

  return response.json()
}
