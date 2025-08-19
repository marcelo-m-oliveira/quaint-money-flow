/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { CreditCardFactory } from '@/factories/credit-card.factory'
import { authMiddleware } from '@/middleware/auth.middleware'
import { performanceMiddleware } from '@/middleware/performance.middleware'
import { rateLimitMiddlewares } from '@/middleware/rate-limit.middleware'
import { redisCacheMiddlewares } from '@/middleware/redis-cache.middleware'
import {
  validateBody,
  validateParams,
  validateQuery,
} from '@/middleware/validation.middleware'
import {
  creditCardCreateSchema,
  creditCardFiltersSchema,
  creditCardResponseSchema,
  creditCardUpdateSchema,
  creditCardUsageSchema,
  idParamSchema,
  selectOptionSchema,
} from '@/utils/schemas'

export async function creditCardRoutes(app: FastifyInstance) {
  const creditCardController = CreditCardFactory.getController()

  // GET /credit-cards/select-options - Buscar cartões formatados para select
  app.get(
    '/credit-cards/select-options',
    {
      schema: {
        tags: ['💳 Cartões'],
        summary: 'Opções de Cartões para Select',
        description:
          'Retorna lista de cartões formatada para componentes de seleção.',
        response: {
          200: z.array(selectOptionSchema),
          401: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
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
    creditCardController.selectOptions.bind(creditCardController),
  )

  // GET /credit-cards - Listar cartões de crédito
  app.get(
    '/credit-cards',
    {
      schema: {
        tags: ['💳 Cartões'],
        summary: 'Listar Cartões de Crédito',
        description: `
Lista todos os cartões de crédito do usuário.

**Filtros disponíveis:**
- **Busca**: search (nome do cartão)

**Paginação:**
- page: número da página (padrão: 1)
- limit: itens por página (padrão: 20)

**Ordenação:**
- Padrão: data de criação (mais recentes primeiro)
        `,
        querystring: creditCardFiltersSchema,
        response: {
          200: z.object({
            creditCards: z.array(creditCardResponseSchema),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
              hasNext: z.boolean(),
              hasPrev: z.boolean(),
            }),
          }),
          401: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateQuery(creditCardFiltersSchema),
        // redisCacheMiddlewares.list(), // Cache por 5 minutos - DESABILITADO TEMPORARIAMENTE
        rateLimitMiddlewares.authenticated(),
      ],
    },
    creditCardController.index.bind(creditCardController),
  )

  // GET /credit-cards/:id - Buscar cartão específico
  app.get(
    '/credit-cards/:id',
    {
      schema: {
        tags: ['💳 Cartões'],
        summary: 'Buscar Cartão',
        description: 'Recupera um cartão de crédito específico pelo ID.',
        params: idParamSchema,
        response: {
          200: z.object({
            data: creditCardResponseSchema,
          }),
          401: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateParams(idParamSchema),
        // redisCacheMiddlewares.detail(), // Cache por 10 minutos - DESABILITADO TEMPORARIAMENTE
        rateLimitMiddlewares.authenticated(),
      ],
    },
    creditCardController.show.bind(creditCardController),
  )

  // POST /credit-cards - Criar novo cartão
  app.post(
    '/credit-cards',
    {
      schema: {
        tags: ['💳 Cartões'],
        summary: 'Criar Cartão',
        description: `
Cria um novo cartão de crédito.

**Campos obrigatórios:**
- name: nome do cartão
- limit: limite de crédito
- closingDay: dia de fechamento da fatura
- dueDay: dia de vencimento da fatura

**Campos opcionais:**
- icon: ícone da bandeira/banco
- iconType: tipo do ícone
- defaultPaymentAccountId: ID da conta de pagamento padrão
        `,
        body: creditCardCreateSchema,
        response: {
          201: creditCardResponseSchema,
          400: z.object({
            message: z.string(),
            errors: z.record(z.string(), z.array(z.string())).optional(),
          }),
          401: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateBody(creditCardCreateSchema),
        rateLimitMiddlewares.create(),
      ],
    },
    creditCardController.store.bind(creditCardController),
  )

  // PUT /credit-cards/:id - Atualizar cartão
  app.put(
    '/credit-cards/:id',
    {
      schema: {
        tags: ['💳 Cartões'],
        summary: 'Atualizar Cartão',
        description: 'Atualiza completamente um cartão de crédito existente.',
        params: idParamSchema,
        body: creditCardUpdateSchema,
        response: {
          200: creditCardResponseSchema,
          400: z.object({
            message: z.string(),
            errors: z.record(z.string(), z.array(z.string())).optional(),
          }),
          401: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateParams(idParamSchema),
        validateBody(creditCardUpdateSchema),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    creditCardController.update.bind(creditCardController),
  )

  // DELETE /credit-cards/:id - Excluir cartão
  app.delete(
    '/credit-cards/:id',
    {
      schema: {
        tags: ['💳 Cartões'],
        summary: 'Excluir Cartão',
        description: 'Remove permanentemente um cartão de crédito.',
        params: idParamSchema,
        response: {
          204: z.null(),
          401: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
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
    creditCardController.destroy.bind(creditCardController),
  )

  // GET /credit-cards/:id/usage - Buscar uso do cartão
  app.get(
    '/credit-cards/:id/usage',
    {
      schema: {
        tags: ['💳 Cartões'],
        summary: 'Uso do Cartão',
        description:
          'Recupera informações de uso e fatura de um cartão de crédito.',
        params: idParamSchema,
        response: {
          200: z.object({
            data: creditCardUsageSchema,
          }),
          401: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        authMiddleware,
        performanceMiddleware(),
        validateParams(idParamSchema),
        redisCacheMiddlewares.balance(), // Cache por 2 minutos (uso muda frequentemente)
        rateLimitMiddlewares.authenticated(),
      ],
    },
    creditCardController.usage.bind(creditCardController),
  )
}
