import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { UserPreferencesFactory } from '@/factories/user-preferences.factory'
import { authMiddleware } from '@/middleware/auth'
import {
  preferencesCreateSchema,
  preferencesResponseSchema,
  preferencesUpdateSchema,
} from '@/utils/schemas'

export async function userPreferencesRoutes(app: FastifyInstance) {
  const userPreferencesController = UserPreferencesFactory.getController()

  // GET /user-preferences - Buscar preferências do usuário
  app.get(
    '/user-preferences',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Buscar Preferências',
        description: `
Recupera as preferências de configuração do usuário.

**Preferências incluídas:**
- Configurações de moeda e formato
- Preferências de notificação
- Configurações de privacidade
- Temas e personalização
- Configurações de relatórios
- Preferências de dashboard
        `,
        response: {
          200: preferencesResponseSchema,
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    userPreferencesController.show.bind(userPreferencesController),
  )

  // PATCH /user-preferences - Atualizar preferências do usuário (parcial)
  app.patch(
    '/user-preferences',
    {
      schema: {
        tags: ['⚙️ Configurações'],
        summary: 'Atualizar Preferências (Parcial)',
        description: `
Atualiza apenas os campos fornecidos das preferências do usuário.

**Campos atualizáveis:**
- currency: moeda padrão
- dateFormat: formato de data
- timezone: fuso horário
- notifications: configurações de notificação
- theme: tema da interface
- language: idioma
- privacy: configurações de privacidade

**Comportamento:**
- Apenas os campos enviados são atualizados
- Campos não enviados mantêm valores atuais
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

  // POST /user-preferences - Criar/atualizar preferências do usuário (upsert)
  app.post(
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
- currency: moeda padrão
- dateFormat: formato de data
- timezone: fuso horário

**Campos opcionais:**
- notifications: configurações de notificação
- theme: tema da interface
- language: idioma
- privacy: configurações de privacidade
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
- currency: BRL (Real Brasileiro)
- dateFormat: DD/MM/YYYY
- timezone: America/Sao_Paulo
- theme: light
- language: pt-BR
- notifications: habilitadas
- privacy: configurações padrão

**Ação irreversível:** Todas as personalizações serão perdidas.
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
