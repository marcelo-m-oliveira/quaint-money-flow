import { FastifyReply } from 'fastify'
import { dateToSeconds } from '@saas/utils'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta?: {
    timestamp: number
    version: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export class ResponseFormatter {
  static success<T>(
    reply: FastifyReply,
    data: T,
    message?: string,
    statusCode: number = 200,
  ) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: Date.now(),
        version: process.env.API_VERSION || '1.0.0',
      },
    }

    return reply.status(statusCode).send(response)
  }

  static paginated<T>(
    reply: FastifyReply,
    data: PaginatedResponse<T>,
    message?: string,
  ) {
    const response: ApiResponse<T[]> = {
      success: true,
      data: data.items,
      message,
      pagination: data.pagination,
      meta: {
        timestamp: Date.now(),
        version: process.env.API_VERSION || '1.0.0',
      },
    }

    return reply.status(200).send(response)
  }

  static error(
    reply: FastifyReply,
    message: string,
    errors?: Record<string, string[]>,
    statusCode: number = 400,
  ) {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      meta: {
        timestamp: Date.now(),
        version: process.env.API_VERSION || '1.0.0',
      },
    }

    return reply.status(statusCode).send(response)
  }

  static created<T>(
    reply: FastifyReply,
    data: T,
    message?: string,
  ) {
    return this.success(reply, data, message, 201)
  }

  static noContent(reply: FastifyReply) {
    return reply.status(204).send()
  }
}

// Utilitário para converter datas para timestamp em segundos
export const convertDatesToSeconds = <T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[] = ['createdAt', 'updatedAt', 'date'],
): T => {
  const converted = { ...obj }
  
  for (const field of dateFields) {
    if (converted[field] && converted[field] instanceof Date) {
      converted[field] = dateToSeconds(converted[field] as Date)
    }
  }
  
  return converted
}

// Utilitário para converter arrays de objetos com datas
export const convertArrayDatesToSeconds = <T extends Record<string, any>>(
  array: T[],
  dateFields: (keyof T)[] = ['createdAt', 'updatedAt', 'date'],
): T[] => {
  return array.map(item => convertDatesToSeconds(item, dateFields))
}
