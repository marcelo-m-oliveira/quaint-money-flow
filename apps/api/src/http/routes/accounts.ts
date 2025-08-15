/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { AccountFactory } from '@/factories/account.factory'
import {
  accountBalanceSchema,
  accountCreateSchema,
  accountFiltersSchema,
  accountListResponseSchema,
  accountResponseSchema,
  accountUpdateSchema,
  idParamSchema,
  selectOptionSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function accountRoutes(app: FastifyInstance) {
  const accountController = AccountFactory.getController()

  // GET /accounts/select-options - Buscar contas formatadas para select
  app.get(
    '/accounts/select-options',
    {
      schema: {
        tags: ['🏦 Contas'],
        summary: 'Opções de Contas para Select',
        description: 'Retorna lista de contas formatada para componentes de seleção.',
        response: {
          200: z.array(selectOptionSchema),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
          200: accountListResponseSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
          200: accountResponseSchema,
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
          201: accountResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
          200: accountResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
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
          200: accountBalanceSchema,
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    accountController.balance.bind(accountController),
  )
}
