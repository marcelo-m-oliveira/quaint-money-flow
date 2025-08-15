import { apiClient } from '../api'
import { UserPreferences, UserPreferencesFormData } from '../types'

export const userPreferencesService = {
  async get(): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>('/user-preferences')
  },

  async update(data: UserPreferencesFormData): Promise<UserPreferences> {
    return apiClient.patch<UserPreferences>('/user-preferences', data)
  },

  async upsert(data: UserPreferencesFormData): Promise<UserPreferences> {
    return apiClient.post<UserPreferences>('/user-preferences', data)
  },

  async reset(): Promise<UserPreferences> {
    return apiClient.post<UserPreferences>('/user-preferences/reset')
  },
}
