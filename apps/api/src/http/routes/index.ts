// Arquivo de exemplo para estrutura de rotas
// Este arquivo será usado como referência para implementar as rotas da API

import { FastifyInstance } from 'fastify'

// Exemplo de como registrar rotas
export async function exampleRoutes(app: FastifyInstance) {
  // Rota de exemplo
  app.get(
    '/example',
    {
      schema: {
        tags: ['Example'],
        summary: 'Rota de exemplo',
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async () => {
      return { message: 'Esta é uma rota de exemplo' }
    },
  )
}

// TODO: Implementar as seguintes rotas:
// - auth.ts - Rotas de autenticação (login, register, refresh)
// - users.ts - Rotas de usuários (profile, preferences)
// - accounts.ts - Rotas de contas (CRUD)
// - credit-cards.ts - Rotas de cartões de crédito (CRUD)
// - categories.ts - Rotas de categorias (CRUD)
// - transactions.ts - Rotas de transações (CRUD, filtros, relatórios)

// Exemplo de estrutura para cada arquivo de rota:
/*
import { FastifyInstance } from 'fastify'
import { createValidationPreHandler } from '@/utils/validation'
import { transactionSchema } from '@quaint-money/validations'

export async function transactionRoutes(app: FastifyInstance) {
  // GET /transactions
  app.get('/transactions', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Transactions'],
      summary: 'Listar transações',
      security: [{ Bearer: [] }],
      // ... schema definition
    },
  }, async (request) => {
    // Implementation
  })

  // POST /transactions
  app.post('/transactions', {
    preHandler: [
      app.authenticate,
      createValidationPreHandler(transactionSchema)
    ],
    schema: {
      tags: ['Transactions'],
      summary: 'Criar transação',
      security: [{ Bearer: [] }],
      // ... schema definition
    },
  }, async (request) => {
    // Implementation
  })
}
*/
