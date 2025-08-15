import type { FastifyError, FastifyInstance, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { NotFoundError } from '@/http/routes/_errors/not-found-error'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    reply.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof NotFoundError) {
    reply.status(404).send({
      message: error.message,
    })
  }

  console.error(error)

  // send error to some observability platform

  reply.status(500).send({ error: 'Internal server error' })
}

// Utility function for handling errors in controllers
export const handleError = (error: FastifyError, reply: FastifyReply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof NotFoundError) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  console.error(error)

  return reply.status(500).send({ error: 'Internal server error' })
}
