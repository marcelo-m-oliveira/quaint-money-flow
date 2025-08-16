import {
  apiClient,
  ApiResponse,
  UserPreferences,
  UserPreferencesFormData,
} from '@/lib'

export const userPreferencesService = {
  async get(): Promise<ApiResponse<UserPreferences>> {
    return apiClient.get<ApiResponse<UserPreferences>>('/user-preferences')
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
