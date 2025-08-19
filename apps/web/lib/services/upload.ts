import { apiClient } from '@/lib'

export interface UploadResponse {
  url: string
  filename: string
}

export const uploadService = {
  async uploadAvatar(imageData: string): Promise<UploadResponse> {
    return apiClient.post<UploadResponse>(
      '/upload/avatar',
      {
        imageData,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  },
}
