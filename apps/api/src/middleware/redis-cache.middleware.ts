import { createHash } from 'crypto'
import { FastifyReply, FastifyRequest } from 'fastify'

import { getRedisClient, isRedisConnected } from '@/lib/redis'

interface CacheOptions {
  ttl?: number // Tempo de vida em segundos
  key?: string // Chave customizada
  prefix?: string // Prefixo para a chave
  condition?: (request: FastifyRequest) => boolean // Condição para aplicar cache
}

/**
 * Gera uma chave de cache baseada na URL, query params e user ID
 */
function generateCacheKey(req: FastifyRequest, prefix?: string): string {
  const userId = (req as any).user?.sub || 'anonymous'
  const url = req.url
  const method = req.method
  const queryString = req.url.includes('?') ? req.url.split('?')[1] : ''

  const keyData = `${method}:${url}:${userId}:${queryString}`
  const hash = createHash('md5').update(keyData).digest('hex')

  return prefix ? `${prefix}:${hash}` : `cache:${hash}`
}

/**
 * Middleware de cache Redis para GET requests
 */
export function redisCacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutos padrão
    prefix = 'api',
    condition = () => true,
  } = options

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Só aplicar cache para GET requests
    if (request.method !== 'GET') {
      return
    }

    // Verificar se a condição é atendida
    if (!condition(request)) {
      return
    }

    // Verificar se o Redis está disponível
    const isConnected = await isRedisConnected()
    if (!isConnected) {
      request.log.warn('Redis não disponível, pulando cache')
      return
    }

    const redis = getRedisClient()
    const cacheKey = generateCacheKey(request, prefix)

    try {
      // Tentar obter dados do cache
      const cachedData = await redis.get(cacheKey)

      if (cachedData) {
        // Adicionar header indicando que veio do cache
        reply.header('X-Cache', 'HIT')
        reply.header('X-Cache-Key', cacheKey)

        const parsedData = JSON.parse(cachedData)
        return reply.send(parsedData)
      }

      // Adicionar header indicando que não veio do cache
      reply.header('X-Cache', 'MISS')
      reply.header('X-Cache-Key', cacheKey)

      // Armazenar o TTL e chave no contexto da requisição
      ;(request as any).cacheTTL = ttl
      ;(request as any).cacheKey = cacheKey
    } catch (error: any) {
      request.log.error({ error: error.message }, 'Erro ao acessar cache Redis')
      // Em caso de erro, continuar sem cache
    }
  }
}

/**
 * Função utilitária para salvar dados no cache Redis
 */
export async function setCacheData(
  request: FastifyRequest,
  data: any,
  ttl?: number,
): Promise<void> {
  try {
    const isConnected = await isRedisConnected()
    if (!isConnected) {
      return
    }

    const redis = getRedisClient()
    const cacheKey = (request as any).cacheKey || generateCacheKey(request)
    const cacheTTL = ttl || (request as any).cacheTTL || 300

    // Serializar dados para JSON
    const serializedData = JSON.stringify(data)

    // Salvar no Redis com TTL
    await redis.setex(cacheKey, cacheTTL, serializedData)
  } catch (error: any) {
    ;(request as any).log?.error(
      { error: error.message },
      'Erro ao salvar dados no cache Redis',
    )
  }
}

/**
 * Função para invalidar cache por padrão
 */
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    const isConnected = await isRedisConnected()
    if (!isConnected) {
      return
    }

    const redis = getRedisClient()
    const keys = await redis.keys(pattern)

    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Erro ao invalidar cache:', error)
  }
}

/**
 * Função para invalidar cache de contas
 */
export async function invalidateAccountCache(
  userId: string,
  accountId?: string,
): Promise<void> {
  // Invalidar cache de listagem de contas
  await invalidateCacheByPattern(`api:cache:*accounts*:${userId}*`)

  // Se for uma operação em conta específica, invalidar cache de saldo
  if (accountId) {
    await invalidateCacheByPattern(
      `api:cache:*accounts/${accountId}/balance*:${userId}*`,
    )
  }
}

/**
 * Função para invalidar cache de categorias
 */
export async function invalidateCategoryCache(userId: string): Promise<void> {
  await invalidateCacheByPattern(`api:cache:*categories*:${userId}*`)
}

/**
 * Função para invalidar cache de cartões de crédito
 */
export async function invalidateCreditCardCache(
  userId: string,
  cardId?: string,
): Promise<void> {
  await invalidateCacheByPattern(`api:cache:*credit-cards*:${userId}*`)

  if (cardId) {
    await invalidateCacheByPattern(
      `api:cache:*credit-cards/${cardId}*:${userId}*`,
    )
  }
}

/**
 * Função para invalidar cache de lançamentos
 */
export async function invalidateEntryCache(userId: string): Promise<void> {
  await invalidateCacheByPattern(`api:cache:*entries*:${userId}*`)
}

/**
 * Função para invalidar cache de relatórios
 */
export async function invalidateReportCache(userId: string): Promise<void> {
  await invalidateCacheByPattern(`api:cache:*reports*:${userId}*`)
}

/**
 * Middlewares pré-configurados para diferentes tipos de cache
 */
export const redisCacheMiddlewares = {
  // Cache padrão (5 minutos)
  default: () => redisCacheMiddleware({ ttl: 300 }),

  // Cache para listagem (5 minutos)
  list: () =>
    redisCacheMiddleware({
      ttl: 300,
      prefix: 'api:list',
    }),

  // Cache para detalhes (10 minutos)
  detail: () =>
    redisCacheMiddleware({
      ttl: 600,
      prefix: 'api:detail',
    }),

  // Cache para saldos (2 minutos - dados mais voláteis)
  balance: () =>
    redisCacheMiddleware({
      ttl: 120,
      prefix: 'api:balance',
    }),

  // Cache para relatórios (15 minutos - dados mais estáticos)
  report: () =>
    redisCacheMiddleware({
      ttl: 900,
      prefix: 'api:report',
    }),

  // Cache para opções de select (30 minutos)
  selectOptions: () =>
    redisCacheMiddleware({
      ttl: 1800,
      prefix: 'api:select',
    }),

  // Cache customizado
  custom: (options: CacheOptions) => redisCacheMiddleware(options),
}

/**
 * Utilitários para gerenciar cache
 */
export const redisCacheUtils = {
  // Limpar todo o cache
  clearAll: async (): Promise<void> => {
    try {
      const redis = getRedisClient()
      await redis.flushall()
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
    }
  },

  // Obter estatísticas do cache
  getStats: async (): Promise<Record<string, any>> => {
    try {
      const redis = getRedisClient()
      const info = await redis.info()
      const keys = await redis.keys('api:cache:*')

      return {
        totalKeys: keys.length,
        info: info
          .split('\r\n')
          .reduce((acc: Record<string, string>, line: string) => {
            if (line.includes(':')) {
              const [key, value] = line.split(':')
              acc[key] = value
            }
            return acc
          }, {}),
      }
    } catch (error: any) {
      console.error('Erro ao obter estatísticas do cache:', error)
      return { error: error.message }
    }
  },

  // Invalidar cache por entidade
  invalidateAccount: invalidateAccountCache,
  invalidateCategory: invalidateCategoryCache,
  invalidateCreditCard: invalidateCreditCardCache,
  invalidateEntry: invalidateEntryCache,
  invalidateReport: invalidateReportCache,
}
