import { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, ZodSchema } from 'zod'

export interface ValidationError {
  field: string
  message: string
}

export class ValidationException extends Error {
  public errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    super('Validation failed')
    this.name = 'ValidationException'
    this.errors = errors
  }
}

export function formatZodError(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }))
}

export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw new ValidationException(formatZodError(result.error))
  }

  return result.data
}

export function createValidationPreHandler<T>(
  schema: ZodSchema<T>,
  source: 'body' | 'params' | 'query' = 'body',
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data =
        source === 'body'
          ? request.body
          : source === 'params'
            ? request.params
            : request.query

      validateSchema(schema, data)
    } catch (error) {
      if (error instanceof ValidationException) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Os dados fornecidos são inválidos',
          details: error.errors,
        })
      }
      throw error
    }
  }
}
