import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { EntryFactory } from '@/factories/entry.factory'
import {
  entryCreateSchema,
  entryFiltersSchema,
  entryListResponseSchema,
  entryPatchSchema,
  entryResponseSchema,
  entryUpdateSchema,
  idParamSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function entryRoutes(app: FastifyInstance) {
  const entryController = EntryFactory.getController()

  // GET /entries - Listar transações do usuário com filtros
  app.get(
    '/entries',
    {
      schema: {
        tags: ['💰 Transações'],
        summary: 'Listar Transações',
        description: `
Lista todas as transações do usuário com filtros avançados.

**Filtros disponíveis:**
- **Período**: startDate/endDate (timestamp)
- **Tipo**: income (receita) ou expense (despesa)
- **Categoria**: categoryId específica
- **Conta**: accountId ou creditCardId
- **Valor**: minAmount/maxAmount
- **Descrição**: search (busca textual)

**Ordenação:**
- Padrão: data mais recente primeiro
- Personalizável por campo e direção

**Paginação:**
- page: número da página (padrão: 1)
- limit: itens por página (padrão: 20)
        `,
        querystring: entryFiltersSchema,
        response: {
          200: entryListResponseSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    entryController.index.bind(entryController),
  )

  // GET /entries/:id - Buscar transação específica
  app.get(
    '/entries/:id',
    {
      schema: {
        tags: ['💰 Transações'],
        summary: 'Buscar Transação',
        description: 'Recupera uma transação específica pelo ID.',
        params: idParamSchema,
        response: {
          200: entryResponseSchema,
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    entryController.show.bind(entryController),
  )

  // POST /entries - Criar nova transação
  app.post(
    '/entries',
    {
      schema: {
        tags: ['💰 Transações'],
        summary: 'Criar Transação',
        description: `
Cria uma nova transação financeira.

**Campos obrigatórios:**
- amount: valor da transação
- type: income (receita) ou expense (despesa)
- date: data da transação
- categoryId: categoria da transação
- accountId OU creditCardId: conta ou cartão

**Campos opcionais:**
- description: descrição detalhada
- tags: array de tags para organização
        `,
        body: entryCreateSchema,
        response: {
          201: entryResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    entryController.store.bind(entryController),
  )

  // PUT /entries/:id - Atualizar transação
  app.put(
    '/entries/:id',
    {
      schema: {
        tags: ['💰 Transações'],
        summary: 'Atualizar Transação',
        description: 'Atualiza completamente uma transação existente.',
        params: idParamSchema,
        body: entryUpdateSchema,
        response: {
          200: entryResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    entryController.update.bind(entryController),
  )

  // PATCH /entries/:id - Atualizar transação parcialmente
  app.patch(
    '/entries/:id',
    {
      schema: {
        tags: ['💰 Transações'],
        summary: 'Atualizar Transação Parcialmente',
        description: 'Atualiza apenas os campos fornecidos de uma transação.',
        params: idParamSchema,
        body: entryPatchSchema,
        response: {
          200: entryResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    entryController.patch.bind(entryController),
  )

  // DELETE /entries/:id - Excluir transação
  app.delete(
    '/entries/:id',
    {
      schema: {
        tags: ['💰 Transações'],
        summary: 'Excluir Transação',
        description: 'Remove permanentemente uma transação.',
        params: idParamSchema,
        response: {
          204: z.null(),
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    entryController.destroy.bind(entryController),
  )
}
