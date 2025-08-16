import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

import { handleError } from '@/utils/errors'
import { ResponseFormatter } from '@/utils/response'

export interface BaseControllerOptions {
  entityName: string
  entityNamePlural: string
}

export abstract class BaseController {
  protected entityName: string
  protected entityNamePlural: string

  constructor(options: BaseControllerOptions) {
    this.entityName = options.entityName
    this.entityNamePlural = options.entityNamePlural
  }

  protected async handleRequest<T>(
    request: FastifyRequest,
    reply: FastifyReply,
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<FastifyReply> {
    try {
      const userId = request.user?.sub
      request.log.info(
        { userId, operation: operationName },
        `Iniciando ${operationName}`,
      )

      const result = await operation()

      request.log.info(
        { userId, operation: operationName },
        `${operationName} concluído com sucesso`,
      )
      return ResponseFormatter.success(reply, result)
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: operationName },
        `Erro em ${operationName}`,
      )
      return this.handleControllerError(error, reply)
    }
  }

  protected async handlePaginatedRequest<T>(
    request: FastifyRequest,
    reply: FastifyReply,
    operation: () => Promise<{ items: T[]; pagination: any }>,
    operationName: string,
  ): Promise<FastifyReply> {
    try {
      const userId = request.user?.sub
      request.log.info(
        { userId, operation: operationName },
        `Iniciando ${operationName}`,
      )

      const result = await operation()

      request.log.info(
        {
          userId,
          operation: operationName,
          totalItems: result.items.length,
          totalPages: result.pagination.totalPages,
        },
        `${operationName} concluído com sucesso`,
      )

      return ResponseFormatter.paginated(reply, result)
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: operationName },
        `Erro em ${operationName}`,
      )
      return this.handleControllerError(error, reply)
    }
  }

  protected async handleCreateRequest<T>(
    request: FastifyRequest,
    reply: FastifyReply,
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<FastifyReply> {
    try {
      const userId = request.user?.sub
      request.log.info(
        { userId, operation: operationName },
        `Iniciando ${operationName}`,
      )

      const result = await operation()

      request.log.info(
        { userId, operation: operationName },
        `${operationName} concluído com sucesso`,
      )
      return ResponseFormatter.created(
        reply,
        result,
        `${this.entityName} criado com sucesso`,
      )
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: operationName },
        `Erro em ${operationName}`,
      )
      return this.handleControllerError(error, reply)
    }
  }

  protected async handleUpdateRequest<T>(
    request: FastifyRequest,
    reply: FastifyReply,
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<FastifyReply> {
    try {
      const userId = request.user?.sub
      request.log.info(
        { userId, operation: operationName },
        `Iniciando ${operationName}`,
      )

      const result = await operation()

      request.log.info(
        { userId, operation: operationName },
        `${operationName} concluído com sucesso`,
      )
      return ResponseFormatter.success(
        reply,
        result,
        `${this.entityName} atualizado com sucesso`,
      )
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: operationName },
        `Erro em ${operationName}`,
      )
      return this.handleControllerError(error, reply)
    }
  }

  protected async handleDeleteRequest(
    request: FastifyRequest,
    reply: FastifyReply,
    operation: () => Promise<void>,
    operationName: string,
  ): Promise<FastifyReply> {
    try {
      const userId = request.user?.sub
      request.log.info(
        { userId, operation: operationName },
        `Iniciando ${operationName}`,
      )

      await operation()

      request.log.info(
        { userId, operation: operationName },
        `${operationName} concluído com sucesso`,
      )
      return ResponseFormatter.noContent(reply)
    } catch (error: any) {
      request.log.error(
        { error: error.message, operation: operationName },
        `Erro em ${operationName}`,
      )
      return this.handleControllerError(error, reply)
    }
  }

  private handleControllerError(error: any, reply: FastifyReply): FastifyReply {
    if (error instanceof ZodError) {
      return ResponseFormatter.error(
        reply,
        'Erro de validação',
        error.flatten().fieldErrors,
        400,
      )
    }

    return handleError(error as FastifyError, reply)
  }

  protected getUserId(request: FastifyRequest): string {
    return request.user?.sub
  }

  protected getQueryParams<T>(request: FastifyRequest): T {
    return request.query as T
  }

  protected getBodyParams<T>(request: FastifyRequest): T {
    return request.body as T
  }

  protected getPathParams<T>(request: FastifyRequest): T {
    return request.params as T
  }
}
