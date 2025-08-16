import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { UserPreferencesFactory } from '@/factories/user-preferences.factory'
import { authMiddleware } from '@/middleware/auth.middleware'
import {
  preferencesCreateSchema,
  preferencesResponseSchema,
  preferencesUpdateSchema,
} from '@/utils/schemas'

export async function userPreferencesRoutes(app: FastifyInstance) {
  const userPreferencesController = UserPreferencesFactory.getController()

  // GET /user-preferences - Buscar preferências do usuário atual
  app.get(
    '/user-preferences',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Buscar Preferências do Usuário',
        description: `
Recupera as preferências de configuração do usuário autenticado.

**Preferências incluídas:**
- Configurações de ordenação de transações
- Período de navegação padrão
- Configurações de visualização
- Preferências de dashboard
- Configurações de resumo financeiro

**Comportamento:**
- Se preferências não existem: cria com valores padrão
- Retorna preferências existentes ou recém-criadas
        `,
        response: {
          200: preferencesResponseSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.show.bind(userPreferencesController),
  )

  // GET /user-preferences/:id - Buscar preferências por ID
  app.get(
    '/user-preferences/:id',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Buscar Preferências por ID',
        description: `
Recupera as preferências de configuração por ID específico.

**Validações:**
- Verifica se as preferências existem
- Verifica se pertencem ao usuário autenticado
- Retorna erro se não encontradas ou não autorizadas
        `,
        params: z.object({
          id: z.string().min(1, 'ID é obrigatório'),
        }),
        response: {
          200: preferencesResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.showById.bind(userPreferencesController),
  )

  // POST /user-preferences - Criar novas preferências
  app.post(
    '/user-preferences',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Criar Preferências',
        description: `
Cria novas preferências de configuração para o usuário.

**Campos obrigatórios:**
- entryOrder: ordem de exibição das transações
- defaultNavigationPeriod: período de navegação padrão
- showDailyBalance: exibir saldo diário
- viewMode: modo de visualização
- isFinancialSummaryExpanded: resumo financeiro expandido

**Validações:**
- Verifica se já existem preferências para o usuário
- Retorna erro se preferências já existem
        `,
        body: preferencesCreateSchema,
        response: {
          201: preferencesResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.create.bind(userPreferencesController),
  )

  // PATCH /user-preferences - Atualizar preferências (parcial)
  app.patch(
    '/user-preferences',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Atualizar Preferências (Parcial)',
        description: `
Atualiza apenas os campos fornecidos das preferências do usuário.

**Campos atualizáveis:**
- entryOrder: ordem de exibição das transações
- defaultNavigationPeriod: período de navegação padrão
- showDailyBalance: exibir saldo diário
- viewMode: modo de visualização
- isFinancialSummaryExpanded: resumo financeiro expandido

**Comportamento:**
- Apenas os campos enviados são atualizados
- Campos não enviados mantêm valores atuais
- Se preferências não existem: cria com valores padrão + dados fornecidos
        `,
        body: preferencesUpdateSchema,
        response: {
          200: preferencesResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.update.bind(userPreferencesController),
  )

  // PUT /user-preferences - Criar/atualizar preferências (upsert)
  app.put(
    '/user-preferences',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Criar/Atualizar Preferências (Upsert)',
        description: `
Cria ou atualiza completamente as preferências do usuário.

**Comportamento:**
- Se preferências existem: atualiza completamente
- Se preferências não existem: cria novas
- Substitui todos os valores pelos fornecidos

**Campos obrigatórios:**
- entryOrder: ordem de exibição das transações
- defaultNavigationPeriod: período de navegação padrão
- showDailyBalance: exibir saldo diário
- viewMode: modo de visualização
- isFinancialSummaryExpanded: resumo financeiro expandido
        `,
        body: preferencesCreateSchema,
        response: {
          200: preferencesResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.upsert.bind(userPreferencesController),
  )

  // DELETE /user-preferences - Excluir preferências
  app.delete(
    '/user-preferences',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Excluir Preferências',
        description: `
Exclui as preferências de configuração do usuário.

**Comportamento:**
- Remove completamente as preferências do usuário
- Retorna as preferências excluídas
- Após exclusão, novas consultas criarão preferências padrão

**Ação irreversível:** Todas as configurações serão perdidas.
        `,
        response: {
          200: preferencesResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.delete.bind(userPreferencesController),
  )

  // POST /user-preferences/reset - Resetar preferências para valores padrão
  app.post(
    '/user-preferences/reset',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Resetar Preferências',
        description: `
Restaura as preferências do usuário para os valores padrão do sistema.

**Valores padrão:**
- entryOrder: descending (mais recentes primeiro)
- defaultNavigationPeriod: monthly (mensal)
- showDailyBalance: false (não exibir saldo diário)
- viewMode: all (visualizar todas as transações)
- isFinancialSummaryExpanded: false (resumo recolhido)

**Comportamento:**
- Substitui todas as configurações pelos valores padrão
- Mantém o registro existente, apenas atualiza os valores
        `,
        response: {
          200: preferencesResponseSchema,
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.reset.bind(userPreferencesController),
  )
}
