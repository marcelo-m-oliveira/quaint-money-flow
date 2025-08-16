import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { AccountFactory } from '@/factories/account.factory'
import { performanceMiddleware } from '@/middleware/performance.middleware'
import { rateLimitMiddlewares } from '@/middleware/rate-limit.middleware'
import { redisCacheMiddlewares } from '@/middleware/redis-cache.middleware'
import {
  validateBody,
  validateParams,
  validateQuery,
} from '@/middleware/validation.middleware'
import {
  accountBalanceSchema,
  accountCreateSchema,
  accountFiltersSchema,
  accountResponseSchema,
  accountUpdateSchema,
  idParamSchema,
  selectOptionSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middleware/auth.middleware'

export async function accountRoutes(app: FastifyInstance) {
  const accountController = AccountFactory.getController()

  // GET /accounts/select-options - Buscar contas formatadas para select
  app.get(
    '/accounts/select-options',
    {
      schema: {
        tags: ['🏦 Contas'],
        summary: 'Opções de Contas para Select',
        description:
          'Retorna lista de contas formatada para componentes de seleção.',
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.array(selectOptionSchema),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          401: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        redisCacheMiddlewares.list(), // Cache por 5 minutos
        rateLimitMiddlewares.authenticated(),
      ],
    },
    accountController.selectOptions.bind(accountController),
  )

  // GET /accounts - Listar contas
  app.get(
    '/accounts',
    {
      schema: {
        tags: ['🏦 Contas'],
        summary: 'Listar Contas',
        description: `
Lista todas as contas bancárias do usuário.

**Filtros disponíveis:**
- **Tipo**: type (bank, savings, investment)
- **Ativo**: active (true/false)
- **Busca**: search (nome da conta)

**Ordenação:**
- Padrão: nome alfabeticamente
- Personalizável por campo e direção

**Paginação:**
- page: número da página (padrão: 1)
- limit: itens por página (padrão: 20)
        `,
        querystring: accountFiltersSchema,
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.array(accountResponseSchema),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
              hasNext: z.boolean(),
              hasPrev: z.boolean(),
            }),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          401: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateQuery(accountFiltersSchema),
        redisCacheMiddlewares.list(), // Cache por 5 minutos
        rateLimitMiddlewares.authenticated(),
      ],
    },
    accountController.index.bind(accountController),
  )

  // GET /accounts/:id - Buscar conta específica
  app.get(
    '/accounts/:id',
    {
      schema: {
        tags: ['🏦 Contas'],
        summary: 'Buscar Conta',
        description: 'Recupera uma conta bancária específica pelo ID.',
        params: idParamSchema,
        response: {
          200: z.object({
            success: z.boolean(),
            data: accountResponseSchema,
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          401: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateParams(idParamSchema),
        redisCacheMiddlewares.detail(), // Cache por 10 minutos
        rateLimitMiddlewares.authenticated(),
      ],
    },
    accountController.show.bind(accountController),
  )

  // POST /accounts - Criar nova conta
  app.post(
    '/accounts',
    {
      schema: {
        tags: ['🏦 Contas'],
        summary: 'Criar Conta',
        description: `
Cria uma nova conta bancária.

**Campos obrigatórios:**
- name: nome da conta
- type: tipo da conta (bank, savings, investment)
- balance: saldo inicial

**Campos opcionais:**
- description: descrição da conta
- icon: ícone da instituição
- color: cor personalizada
- active: status ativo (padrão: true)
        `,
        body: accountCreateSchema,
        response: {
          201: z.object({
            success: z.boolean(),
            data: accountResponseSchema,
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.record(z.string(), z.array(z.string())).optional(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          401: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateBody(accountCreateSchema),
        rateLimitMiddlewares.create(),
      ],
    },
    accountController.store.bind(accountController),
  )

  // PUT /accounts/:id - Atualizar conta
  app.put(
    '/accounts/:id',
    {
      schema: {
        tags: ['🏦 Contas'],
        summary: 'Atualizar Conta',
        description: 'Atualiza completamente uma conta bancária existente.',
        params: idParamSchema,
        body: accountUpdateSchema,
        response: {
          200: z.object({
            success: z.boolean(),
            data: accountResponseSchema,
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.record(z.string(), z.array(z.string())).optional(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          401: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateParams(idParamSchema),
        validateBody(accountUpdateSchema),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    accountController.update.bind(accountController),
  )

  // DELETE /accounts/:id - Excluir conta
  app.delete(
    '/accounts/:id',
    {
      schema: {
        tags: ['🏦 Contas'],
        summary: 'Excluir Conta',
        description: 'Remove permanentemente uma conta bancária.',
        params: idParamSchema,
        response: {
          204: z.null(),
          401: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateParams(idParamSchema),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    accountController.destroy.bind(accountController),
  )

  // GET /accounts/:id/balance - Buscar saldo da conta
  app.get(
    '/accounts/:id/balance',
    {
      schema: {
        tags: ['🏦 Contas'],
        summary: 'Saldo da Conta',
        description: 'Recupera o saldo atual de uma conta bancária.',
        params: idParamSchema,
        response: {
          200: z.object({
            success: z.boolean(),
            data: accountBalanceSchema,
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          401: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateParams(idParamSchema),
        redisCacheMiddlewares.balance(), // Cache por 2 minutos (saldo muda frequentemente)
        rateLimitMiddlewares.authenticated(),
      ],
    },
    accountController.balance.bind(accountController),
  )
}
