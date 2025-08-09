import { createHash } from 'crypto'
import { NextFunction, Request, Response } from 'express'

// Interface para o cache em memória (pode ser substituído por Redis)
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutos

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  get(key: string): any | null {
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
function generateCacheKey(req: Request): string {
  const userId = req.user?.id || 'anonymous'
  const url = req.originalUrl || req.url
  const method = req.method

  const keyData = `${method}:${url}:${userId}`
  return createHash('md5').update(keyData).digest('hex')
}

/**
 * Middleware de cache para GET requests
 */
export function cacheMiddleware(ttl?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Só aplicar cache para GET requests
    if (req.method !== 'GET') {
      return next()
    }

    const cacheKey = generateCacheKey(req)
    const cachedData = memoryCache.get(cacheKey)

    if (cachedData) {
      // Adicionar header indicando que veio do cache
      res.set('X-Cache', 'HIT')
      return res.json(cachedData)
    }

    // Interceptar o método json para salvar no cache
    const originalJson = res.json.bind(res)
    res.json = function (data: any) {
      // Salvar no cache apenas se a resposta for bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, data, ttl)
        res.set('X-Cache', 'MISS')
      }
      return originalJson(data)
    }

    next()
  }
}

/**
 * Middleware para invalidar cache relacionado a contas
 */
export function invalidateAccountCache(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id

  if (!userId) {
    return next()
  }

  // Interceptar resposta para invalidar cache após operações de escrita
  const originalJson = res.json.bind(res)
  res.json = function (data: any) {
    // Invalidar cache apenas se a operação foi bem-sucedida
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Invalidar cache de listagem de contas
      const listCacheKey = createHash('md5')
        .update(`GET:/accounts:${userId}`)
        .digest('hex')
      memoryCache.delete(listCacheKey)

      // Se for uma operação em conta específica, invalidar cache de saldo
      if (req.params.id) {
        const balanceCacheKey = createHash('md5')
          .update(`GET:/accounts/${req.params.id}/balance:${userId}`)
          .digest('hex')
        memoryCache.delete(balanceCacheKey)
      }
    }
    return originalJson(data)
  }

  next()
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
