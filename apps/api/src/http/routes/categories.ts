/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { CategoryFactory } from '@/factories/category.factory'
import {
  categoryCreateSchema,
  categoryFiltersSchema,
  categoryResponseSchema,
  categoryUpdateSchema,
  categoryUsageSchema,
  idParamSchema,
  selectOptionSchema,
} from '@/utils/schemas'

import { authMiddleware } from '../middlewares/auth'

export async function categoryRoutes(app: FastifyInstance) {
  const categoryController = CategoryFactory.getController()

  // GET /categories - Listar categorias
  app.get(
    '/categories',
    {
      schema: {
        tags: ['📂 Categorias'],
        summary: 'Listar Categorias',
        description: `
Lista todas as categorias do usuário com suporte a hierarquia.

**Filtros disponíveis:**
- **Tipo**: type (income/expense) - filtra por tipo de transação
- **Pai**: parentId - mostra apenas subcategorias de uma categoria específica
- **Ativo**: active (true/false) - status da categoria
- **Busca**: search - busca por nome da categoria

**Hierarquia:**
- Categorias pai (parentId = null)
- Subcategorias (parentId = ID da categoria pai)
- Suporte a múltiplos níveis

**Paginação:**
- page: número da página (padrão: 1)
- limit: itens por página (padrão: 20)
        `,
        querystring: categoryFiltersSchema,
        response: {
          200: z.object({
            categories: z.array(categoryResponseSchema),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
              hasNext: z.boolean(),
              hasPrev: z.boolean(),
            }),
          }),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    categoryController.index.bind(categoryController),
  )

  // GET /categories/select-options - Opções para selects
  app.get(
    '/categories/select-options',
    {
      schema: {
        tags: ['📂 Categorias'],
        summary: 'Opções de Categorias para Select',
        description: `
Retorna lista de categorias formatada para componentes de seleção.

**Filtros:**
- **type**: income/expense - filtra por tipo de transação
- Retorna apenas categorias ativas
        `,
        querystring: z.object({
          type: z.enum(['income', 'expense']).optional(),
        }),
        response: {
          200: z.array(selectOptionSchema),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    categoryController.select.bind(categoryController),
  )

  // GET /categories/usage - Indicadores de uso
  app.get(
    '/categories/usage',
    {
      schema: {
        tags: ['📂 Categorias'],
        summary: 'Indicadores de Uso das Categorias',
        description: `
Retorna estatísticas de uso das categorias.

**Informações retornadas:**
- Número de transações por categoria
- Valor total movimentado
- Percentual de uso
- Ranking de utilização
        `,
        response: {
          200: z.array(categoryUsageSchema),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    categoryController.usage.bind(categoryController),
  )

  // GET /categories/:id - Buscar por ID
  app.get(
    '/categories/:id',
    {
      schema: {
        tags: ['📂 Categorias'],
        summary: 'Buscar Categoria',
        description: 'Recupera uma categoria específica pelo ID.',
        params: idParamSchema,
        response: {
          200: categoryResponseSchema,
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    categoryController.show.bind(categoryController),
  )

  // POST /categories - Criar
  app.post(
    '/categories',
    {
      schema: {
        tags: ['📂 Categorias'],
        summary: 'Criar Categoria',
        description: `
Cria uma nova categoria ou subcategoria.

**Campos obrigatórios:**
- name: nome da categoria
- type: tipo (income/expense)

**Campos opcionais:**
- description: descrição da categoria
- color: cor personalizada
- icon: ícone da categoria
- parentId: ID da categoria pai (para subcategorias)
- active: status ativo (padrão: true)

**Hierarquia:**
- Para categoria pai: omita parentId ou use null
- Para subcategoria: use parentId com ID da categoria pai
        `,
        body: categoryCreateSchema,
        response: {
          201: categoryResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    categoryController.store.bind(categoryController),
  )

  // PUT /categories/:id - Atualizar
  app.put(
    '/categories/:id',
    {
      schema: {
        tags: ['📂 Categorias'],
        summary: 'Atualizar Categoria',
        description: 'Atualiza completamente uma categoria existente.',
        params: idParamSchema,
        body: categoryUpdateSchema,
        response: {
          200: categoryResponseSchema,
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    categoryController.update.bind(categoryController),
  )

  // DELETE /categories/:id - Excluir
  app.delete(
    '/categories/:id',
    {
      schema: {
        tags: ['📂 Categorias'],
        summary: 'Excluir Categoria',
        description: `
Remove permanentemente uma categoria.

**Observações:**
- Categorias com subcategorias não podem ser excluídas
- Categorias com transações associadas não podem ser excluídas
- Use desativação (active: false) como alternativa
        `,
        params: idParamSchema,
        response: {
          204: z.null(),
          400: z.object({ error: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authMiddleware],
    },
    categoryController.destroy.bind(categoryController),
  )
}
