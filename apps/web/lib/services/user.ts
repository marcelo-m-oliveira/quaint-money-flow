import { apiClient } from '@/lib/api'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
}

export interface AccountStatus {
  hasGoogleProvider: boolean
  needsPasswordSetup: boolean
  hasValidPassword: boolean
  providers: Array<{
    provider: string
    providerUserId: string
    createdAt: string
  }>
}

export const userService = {
  async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/me')
  },

  async updateProfile(data: {
    name: string
    avatarUrl?: string | null
  }): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/users/me', data)
  },

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<void> {
    return apiClient.put<void>('/users/password', data)
  },

  async getAccountStatus(): Promise<AccountStatus> {
    return apiClient.get<AccountStatus>('/users/account-status')
  },
}
