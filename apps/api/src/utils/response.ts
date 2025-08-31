import { dateToSeconds } from '@saas/utils'
import { FastifyReply } from 'fastify'

export interface ApiResponse<T = any> {
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
  static success<T>(reply: FastifyReply, data: T, statusCode: number = 200) {
    const response: ApiResponse<T> = {
      data,
    }

    return reply.status(statusCode).send(response)
  }

  // Novo método para retornar dados diretamente
  static data<T>(reply: FastifyReply, data: T, statusCode: number = 200) {
    return reply.status(statusCode).send(data)
  }

  // Novo método para retornar dados criados diretamente
  static createdData<T>(reply: FastifyReply, data: T) {
    return reply.status(201).send(data)
  }

  static paginated<T>(
    reply: FastifyReply,
    data: PaginatedResponse<T>,
    message?: string,
  ) {
    const response: ApiResponse<T[]> = {
      data: data.items,
      message,
      pagination: data.pagination,
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
      message,
      errors,
    }

    return reply.status(statusCode).send(response)
  }

  static created<T>(reply: FastifyReply, data: T) {
    return this.success(reply, data, 201)
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
  const converted = { ...obj } as any

  for (const field of dateFields) {
    if (converted[field] && converted[field] instanceof Date) {
      converted[field] = dateToSeconds(converted[field] as Date)
    }
  }

  return converted as T
}

// Utilitário para converter arrays de objetos com datas
export const convertArrayDatesToSeconds = <T extends Record<string, any>>(
  array: T[],
  dateFields: (keyof T)[] = ['createdAt', 'updatedAt', 'date'],
): T[] => {
  return array.map((item) => convertDatesToSeconds(item, dateFields))
}

// Utilitário para converter campos Decimal para number
export const convertDecimalsToNumbers = <T extends Record<string, any>>(
  obj: T,
  decimalFields: (keyof T)[] = ['price', 'amount', 'limit', 'discountValue'],
): T => {
  const converted = { ...obj } as any

  for (const field of decimalFields) {
    if (converted[field] !== null && converted[field] !== undefined) {
      converted[field] = Number(converted[field])
    }
  }

  return converted as T
}

// Utilitário para converter arrays de objetos com campos Decimal
export const convertArrayDecimalsToNumbers = <T extends Record<string, any>>(
  array: T[],
  decimalFields: (keyof T)[] = ['price', 'amount', 'limit', 'discountValue'],
): T[] => {
  return array.map((item) => convertDecimalsToNumbers(item, decimalFields))
}

// Utilitário para converter usuários (datas + decimais)
export const convertUserForResponse = <T extends Record<string, any>>(
  user: T,
): T => {
  const userWithoutPassword = { ...user }
  delete userWithoutPassword.password

  const userWithConvertedDates = convertDatesToSeconds(userWithoutPassword)
  return convertDecimalsToNumbers(userWithConvertedDates)
}

// Utilitário para converter arrays de usuários
export const convertUsersForResponse = <T extends Record<string, any>>(
  users: T[],
): T[] => {
  return users.map((user) => convertUserForResponse(user))
}
