/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { CreditCardFactory } from '@/factories/credit-card.factory'
import {
  creditCardCreateSchema,
  creditCardListResponseSchema,
  creditCardResponseSchema,
  creditCardUpdateSchema,
  creditCardUsageSchema,
  idParamSchema,
  paginationSchema,
  selectOptionSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middleware/auth.middleware'

export async function creditCardRoutes(app: FastifyInstance) {
  const creditCardController = CreditCardFactory.getController()

  // GET /credit-cards - Listar cartões de crédito
  app.get(
    '/credit-cards',
    {
      schema: {
        tags: ['💳 Cartões'],
        summary: 'Listar Cartões de Crédito',
        description: `
Lista todos os cartões de crédito do usuário.

**Paginação:**
- page: número da página (padrão: 1)
- limit: itens por página (padrão: 20)

**Ordenação:**
- Padrão: nome alfabeticamente
        `,
        querystring: paginationSchema,
        response: {
          200: creditCardListResponseSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    creditCardController.index.bind(creditCardController),
  )

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
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    creditCardController.selectOptions.bind(creditCardController),
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
          200: creditCardResponseSchema,
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
- dueDay: dia de vencimento da fatura

**Campos opcionais:**
- description: descrição do cartão
- icon: ícone da bandeira/banco
- color: cor personalizada
- active: status ativo (padrão: true)
        `,
        body: creditCardCreateSchema,
        response: {
          201: creditCardResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
          200: creditCardUsageSchema,
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    creditCardController.usage.bind(creditCardController),
  )
}
