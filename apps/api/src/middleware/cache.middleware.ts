import { createHash } from 'crypto'
import { FastifyReply, FastifyRequest } from 'fastify'

// Interface para o cache em memória (pode ser substituído por Redis)
interface CacheEntry {
  data: never
  timestamp: number
  ttl: number
}

class MemoryCache {
  cache = new Map<string, CacheEntry>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutos

  set(key: string, data: never, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  get(key: string): never | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Verificar se o cache expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Limpar entradas expiradas periodicamente
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Instância singleton do cache
const memoryCache = new MemoryCache()

// Limpar cache expirado a cada 10 minutos
setInterval(
  () => {
    memoryCache.cleanup()
  },
  10 * 60 * 1000,
)

/**
 * Gera uma chave de cache baseada na URL, query params e user ID
 */
function generateCacheKey(req: FastifyRequest): string {
  const userId = (req as any).user?.id || 'anonymous'
  const url = req.url
  const method = req.method

  const keyData = `${method}:${url}:${userId}`
  return createHash('md5').update(keyData).digest('hex')
}

/**
 * Middleware de cache para GET requests (Fastify)
 * Para usar com Fastify, deve ser registrado como preHandler
 */
export function cacheMiddleware(ttl?: number) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Só aplicar cache para GET requests
    if (request.method !== 'GET') {
      return
    }

    const cacheKey = generateCacheKey(request)
    const cachedData = memoryCache.get(cacheKey)

    if (cachedData) {
      // Adicionar header indicando que veio do cache
      reply.header('X-Cache', 'HIT')
      return reply.send(cachedData)
    }

    // Adicionar header indicando que não veio do cache
    reply.header('X-Cache', 'MISS')

    // Armazenar o TTL no contexto da requisição para uso posterior
    ;(request as any).cacheTTL = ttl
  }
}

/**
 * Função utilitária para salvar dados no cache
 */
export function setCacheData(request: FastifyRequest, data: never) {
  const cacheKey = generateCacheKey(request)
  const ttl = (request as any).cacheTTL
  memoryCache.set(cacheKey, data, ttl)
}

/**
 * Função para invalidar cache relacionado a contas
 */
export function invalidateAccountCache(userId: string, accountId?: string) {
  // Invalidar cache de listagem de contas
  const listCacheKey = createHash('md5')
    .update(`GET:/api/v1/accounts:${userId}`)
    .digest('hex')
  memoryCache.delete(listCacheKey)

  // Se for uma operação em conta específica, invalidar cache de saldo
  if (accountId) {
    const balanceCacheKey = createHash('md5')
      .update(`GET:/api/v1/accounts/${accountId}/balance:${userId}`)
      .digest('hex')
    memoryCache.delete(balanceCacheKey)
  }
}

/**
 * Utilitário para limpar todo o cache (útil para testes)
 */
export function clearCache(): void {
  memoryCache.clear()
}

/**
 * Utilitário para obter estatísticas do cache
 */
export function getCacheStats() {
  return {
    size: memoryCache.cache.size,
    // Adicionar mais estatísticas conforme necessário
  }
}

/**
 * Cache específico para saldos de contas (TTL menor devido à volatilidade)
 */
export function balanceCacheMiddleware() {
  return cacheMiddleware(2 * 60 * 1000) // 2 minutos
}

/**
 * Cache para listagem de contas (TTL maior pois muda menos frequentemente)
 */
export function accountListCacheMiddleware() {
  return cacheMiddleware(5 * 60 * 1000) // 5 minutos
}
