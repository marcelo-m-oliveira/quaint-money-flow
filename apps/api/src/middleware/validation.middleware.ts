import { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, ZodSchema } from 'zod'

import { ResponseFormatter } from '@/utils/response'

export interface ValidationOptions {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
  headers?: ZodSchema
}

export const validationMiddleware = (schemas: ValidationOptions) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validar body
      if (schemas.body && request.body) {
        request.body = schemas.body.parse(request.body)
      }

      // Validar query params
      if (schemas.query && request.query) {
        request.query = schemas.query.parse(request.query)
      }

      // Validar path params
      if (schemas.params && request.params) {
        request.params = schemas.params.parse(request.params)
      }

      // Validar headers
      if (schemas.headers && request.headers) {
        schemas.headers.parse(request.headers)
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return ResponseFormatter.error(
          reply,
          'Erro de validação',
          error.flatten().fieldErrors,
          400,
        )
      }
      throw error
    }
  }
}

// Middlewares específicos para diferentes tipos de validação
export const validateBody = (schema: ZodSchema) =>
  validationMiddleware({ body: schema })
export const validateQuery = (schema: ZodSchema) =>
  validationMiddleware({ query: schema })
export const validateParams = (schema: ZodSchema) =>
  validationMiddleware({ params: schema })
export const validateHeaders = (schema: ZodSchema) =>
  validationMiddleware({ headers: schema })

// Middleware para validação de paginação
export const validatePagination = () => {
  return validationMiddleware({
    query: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
    } as any,
  })
}

// Middleware para validação de IDs
export const validateId = () => {
  return validationMiddleware({
    params: {
      id: { type: 'string', minLength: 1 },
    } as any,
  })
}
