import { env } from '@saas/env'
import type { FastifyError, FastifyInstance, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

import { BadRequestError } from '@/routes/_errors/bad-request-error'
import { NotFoundError } from '@/routes/_errors/not-found-error'
import { UnauthorizedError } from '@/routes/_errors/unauthorized-error'
import { ResponseFormatter } from '@/utils/response'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return ResponseFormatter.error(
      reply,
      'Validation error',
      error.flatten().fieldErrors,
      400,
    )
  }

  if (error instanceof BadRequestError) {
    return ResponseFormatter.error(reply, error.message, undefined, 400)
  }

  if (error instanceof UnauthorizedError) {
    return ResponseFormatter.error(reply, error.message, undefined, 401)
  }

  if (error instanceof NotFoundError) {
    return ResponseFormatter.error(reply, error.message, undefined, 404)
  }

  if (env.NODE_ENV !== 'test') {
    console.error(error)
  }

  // send error to some observability platform

  return ResponseFormatter.error(reply, 'Internal server error', undefined, 500)
}

// Utility function for handling errors in controllers
export const handleError = (error: FastifyError, reply: FastifyReply) => {
  if (error instanceof ZodError) {
    return ResponseFormatter.error(
      reply,
      'Validation error',
      error.flatten().fieldErrors,
      400,
    )
  }

  if (error instanceof BadRequestError) {
    return ResponseFormatter.error(reply, error.message, undefined, 400)
  }

  if (error instanceof UnauthorizedError) {
    return ResponseFormatter.error(reply, error.message, undefined, 401)
  }

  if (error instanceof NotFoundError) {
    return ResponseFormatter.error(reply, error.message, undefined, 404)
  }

  if (env.NODE_ENV !== 'test') {
    console.error(error)
  }

  return ResponseFormatter.error(reply, 'Internal server error', undefined, 500)
}
