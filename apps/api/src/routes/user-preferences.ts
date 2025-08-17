import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { UserPreferencesFactory } from '@/factories/user-preferences.factory'
import { authMiddleware } from '@/middleware/auth.middleware'
import { performanceMiddleware } from '@/middleware/performance.middleware'
import { rateLimitMiddlewares } from '@/middleware/rate-limit.middleware'
import {
  validateBody,
  validateParams,
} from '@/middleware/validation.middleware'
import {
  idParamSchema,
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
Se não existirem preferências, retorna erro 404.

**Resposta:**
- 200: Preferências encontradas
- 401: Não autenticado
- 404: Preferências não encontradas
- 500: Erro interno
        `,
        response: {
          200: preferencesResponseSchema,
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
        rateLimitMiddlewares.authenticated(),
      ],
    },
    userPreferencesController.index.bind(userPreferencesController),
  )

  // GET /user-preferences/:id - Buscar preferências por ID
  app.get(
    '/user-preferences/:id',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Buscar Preferências por ID',
        description: `
Recupera preferências específicas por ID.
Valida se as preferências pertencem ao usuário autenticado.

**Parâmetros:**
- id: ID das preferências

**Resposta:**
- 200: Preferências encontradas
- 400: Preferências não pertencem ao usuário
- 401: Não autenticado
- 404: Preferências não encontradas
- 500: Erro interno
        `,
        params: idParamSchema,
        response: {
          200: preferencesResponseSchema,
          400: z.object({
            message: z.string(),
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
        rateLimitMiddlewares.authenticated(),
      ],
    },
    userPreferencesController.show.bind(userPreferencesController),
  )

  // POST /user-preferences - Criar novas preferências
  app.post(
    '/user-preferences',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Criar Preferências',
        description: `
Cria novas preferências para o usuário autenticado.
Só permite criar se não existirem preferências para o usuário.

**Body:**
- entryOrder: Ordem de exibição dos lançamentos
- defaultNavigationPeriod: Período de navegação padrão
- showDailyBalance: Exibir saldo diário
- viewMode: Modo de visualização
- isFinancialSummaryExpanded: Resumo financeiro expandido

**Resposta:**
- 201: Preferências criadas
- 400: Já existem preferências para este usuário
- 401: Não autenticado
- 500: Erro interno
        `,
        body: preferencesCreateSchema,
        response: {
          201: preferencesResponseSchema,
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
        validateBody(preferencesCreateSchema),
        rateLimitMiddlewares.create(),
      ],
    },
    userPreferencesController.store.bind(userPreferencesController),
  )

  // PATCH /user-preferences - Atualizar preferências do usuário atual
  app.patch(
    '/user-preferences',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Atualizar Preferências',
        description: `
Atualiza as preferências do usuário autenticado.
Não é necessário fornecer o ID das preferências, pois cada usuário só pode ter uma.

**Body:**
- entryOrder: Ordem de exibição dos lançamentos (opcional)
- defaultNavigationPeriod: Período de navegação padrão (opcional)
- showDailyBalance: Exibir saldo diário (opcional)
- viewMode: Modo de visualização (opcional)
- isFinancialSummaryExpanded: Resumo financeiro expandido (opcional)

**Resposta:**
- 200: Preferências atualizadas
- 400: Preferências não encontradas
- 401: Não autenticado
- 500: Erro interno
        `,
        body: preferencesUpdateSchema,
        response: {
          200: preferencesResponseSchema,
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
        validateBody(preferencesUpdateSchema),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    userPreferencesController.updateByUserId.bind(userPreferencesController),
  )

  // PUT /user-preferences/:id - Atualizar preferências por ID (método alternativo)
  app.put(
    '/user-preferences/:id',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Atualizar Preferências por ID',
        description: `
Atualiza completamente as preferências do usuário por ID.
Valida se as preferências pertencem ao usuário autenticado.

**Parâmetros:**
- id: ID das preferências

**Body:**
- entryOrder: Ordem de exibição dos lançamentos
- defaultNavigationPeriod: Período de navegação padrão
- showDailyBalance: Exibir saldo diário
- viewMode: Modo de visualização
- isFinancialSummaryExpanded: Resumo financeiro expandido

**Resposta:**
- 200: Preferências atualizadas
- 400: Preferências não pertencem ao usuário
- 401: Não autenticado
- 404: Preferências não encontradas
- 500: Erro interno
        `,
        params: idParamSchema,
        body: preferencesUpdateSchema,
        response: {
          200: preferencesResponseSchema,
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
        validateBody(preferencesUpdateSchema),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    userPreferencesController.update.bind(userPreferencesController),
  )

  // DELETE /user-preferences/:id - Excluir preferências
  app.delete(
    '/user-preferences/:id',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Excluir Preferências',
        description: `
Exclui as preferências do usuário.
Valida se as preferências pertencem ao usuário autenticado.

**Parâmetros:**
- id: ID das preferências

**Resposta:**
- 204: Preferências excluídas
- 400: Preferências não pertencem ao usuário
- 401: Não autenticado
- 404: Preferências não encontradas
- 500: Erro interno
        `,
        params: idParamSchema,
        response: {
          204: z.null(),
          400: z.object({
            message: z.string(),
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
        rateLimitMiddlewares.authenticated(),
      ],
    },
    userPreferencesController.destroy.bind(userPreferencesController),
  )

  // POST /user-preferences/upsert - Upsert preferências (método customizado)
  app.post(
    '/user-preferences/upsert',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Upsert Preferências',
        description: `
Cria ou atualiza preferências do usuário autenticado.
Se existirem, atualiza; se não existirem, cria com valores padrão + dados fornecidos.

**Body:**
- entryOrder: Ordem de exibição dos lançamentos (opcional)
- defaultNavigationPeriod: Período de navegação padrão (opcional)
- showDailyBalance: Exibir saldo diário (opcional)
- viewMode: Modo de visualização (opcional)
- isFinancialSummaryExpanded: Resumo financeiro expandido (opcional)

**Resposta:**
- 200: Preferências criadas/atualizadas
- 401: Não autenticado
- 500: Erro interno
        `,
        body: preferencesCreateSchema.partial(),
        response: {
          200: preferencesResponseSchema,
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
        validateBody(preferencesCreateSchema.partial()),
        rateLimitMiddlewares.authenticated(),
      ],
    },
    userPreferencesController.upsert.bind(userPreferencesController),
  )

  // POST /user-preferences/reset - Reset para valores padrão (método customizado)
  app.post(
    '/user-preferences/reset',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Reset Preferências',
        description: `
Reseta as preferências do usuário para valores padrão.
Se não existirem preferências, cria com valores padrão.

**Resposta:**
- 200: Preferências resetadas/criadas
- 401: Não autenticado
- 500: Erro interno
        `,
        response: {
          200: preferencesResponseSchema,
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
        rateLimitMiddlewares.authenticated(),
      ],
    },
    userPreferencesController.reset.bind(userPreferencesController),
  )

  // POST /user-preferences/default - Criar preferências padrão (método customizado)
  app.post(
    '/user-preferences/default',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Criar Preferências Padrão',
        description: `
Cria preferências com valores padrão para o usuário autenticado.
Só permite criar se não existirem preferências para o usuário.

**Resposta:**
- 201: Preferências padrão criadas
- 400: Já existem preferências para este usuário
- 401: Não autenticado
- 500: Erro interno
        `,
        response: {
          201: preferencesResponseSchema,
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
        rateLimitMiddlewares.create(),
      ],
    },
    userPreferencesController.createDefault.bind(userPreferencesController),
  )
}
