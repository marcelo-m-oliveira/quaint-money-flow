import { FastifyReply, FastifyRequest } from 'fastify'

import { ResponseFormatter } from '@/utils/response'

interface RateLimitConfig {
  windowMs: number // Janela de tempo em milissegundos
  max: number // Máximo de requisições por janela
  message?: string
  statusCode?: number
  keyGenerator?: (request: FastifyRequest) => string
  skip?: (request: FastifyRequest) => boolean
}

class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  get(key: string): { count: number; resetTime: number } | undefined {
    const entry = this.store.get(key)

    if (!entry) return undefined

    // Se a janela expirou, remover a entrada
    if (Date.now() > entry.resetTime) {
      this.store.delete(key)
      return undefined
    }

    return entry
  }

  set(key: string, count: number, windowMs: number): void {
    const resetTime = Date.now() + windowMs
    this.store.set(key, { count, resetTime })
  }

  increment(
    key: string,
    windowMs: number,
  ): { count: number; resetTime: number } {
    const entry = this.get(key)

    if (!entry) {
      this.set(key, 1, windowMs)
      return { count: 1, resetTime: Date.now() + windowMs }
    }

    const newCount = entry.count + 1
    this.set(key, newCount, windowMs)
    return { count: newCount, resetTime: entry.resetTime }
  }

  reset(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

const rateLimitStore = new RateLimitStore()

export const rateLimitMiddleware = (config: RateLimitConfig) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos padrão
    max = 100, // 100 requisições padrão
    message = 'Muitas requisições, tente novamente mais tarde',
    statusCode = 429,
    keyGenerator = (request) => {
      // Usar IP do usuário ou user ID se autenticado
      return (request.user as any)?.sub || request.ip || 'anonymous'
    },
    skip = () => false,
  } = config

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Pular rate limiting se a função skip retornar true
    if (skip(request)) {
      return
    }

    const key = keyGenerator(request)
    const { count, resetTime } = rateLimitStore.increment(key, windowMs)

    // Adicionar headers de rate limit
    reply.header('X-RateLimit-Limit', max)
    reply.header('X-RateLimit-Remaining', Math.max(0, max - count))
    reply.header('X-RateLimit-Reset', new Date(resetTime).toISOString())

    // Se excedeu o limite, retornar erro
    if (count > max) {
      return ResponseFormatter.error(reply, message, undefined, statusCode)
    }
  }
}

// Configurações pré-definidas de rate limiting
export const rateLimitConfigs = {
  // Rate limit padrão para todas as rotas
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições
  },

  // Rate limit mais restritivo para autenticação
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas de login
    message: 'Muitas tentativas de login, tente novamente em 15 minutos',
  },

  // Rate limit para criação de recursos
  create: {
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 criações por minuto
    message: 'Muitas criações, aguarde um momento',
  },

  // Rate limit para relatórios (mais pesados)
  reports: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // 10 relatórios por 5 minutos
    message: 'Muitas requisições de relatório, aguarde um momento',
  },

  // Rate limit para usuários autenticados (mais permissivo)
  authenticated: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // 1000 requisições
    keyGenerator: (request: FastifyRequest) =>
      `user:${(request.user as any)?.sub}`,
    skip: (request: FastifyRequest) => !(request.user as any)?.sub,
  },
}

// Middlewares pré-configurados
export const rateLimitMiddlewares = {
  default: () => rateLimitMiddleware(rateLimitConfigs.default),
  auth: () => rateLimitMiddleware(rateLimitConfigs.auth),
  create: () => rateLimitMiddleware(rateLimitConfigs.create),
  reports: () => rateLimitMiddleware(rateLimitConfigs.reports),
  authenticated: () => rateLimitMiddleware(rateLimitConfigs.authenticated),
}

// Utilitários para gerenciar rate limiting
export const rateLimitUtils = {
  reset: (key: string) => rateLimitStore.reset(key),
  clear: () => rateLimitStore.clear(),

  // Reset rate limit para um usuário específico
  resetForUser: (userId: string) => {
    rateLimitStore.reset(`user:${userId}`)
  },

  // Reset rate limit para um IP específico
  resetForIP: (ip: string) => {
    rateLimitStore.reset(ip)
  },
}
