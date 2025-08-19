import { apiClient, UserPreferences, UserPreferencesFormData } from '@/lib'

export const userPreferencesService = {
  async get(): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>('/user-preferences')
  },

  async update(data: UserPreferencesFormData): Promise<UserPreferences> {
    return apiClient.patch<UserPreferences>('/user-preferences', data)
  },

  async upsert(data: UserPreferencesFormData): Promise<UserPreferences> {
    return apiClient.post<UserPreferences>('/user-preferences/upsert', data)
  },

  async reset(): Promise<UserPreferences> {
    return apiClient.post<UserPreferences>('/user-preferences/reset')
  },

  async createDefault(): Promise<UserPreferences> {
    return apiClient.post<UserPreferences>('/user-preferences/default')
  },
}
