import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { isRedisConnected, redisUtils } from '@/lib/redis'
import { performanceUtils } from '@/middleware/performance.middleware'
import { redisCacheUtils } from '@/middleware/redis-cache.middleware'

export async function healthRoutes(app: FastifyInstance) {
  // GET /health - Health check básico
  app.get(
    '/health',
    {
      schema: {
        tags: ['🏥 Health'],
        summary: 'Health Check',
        description: 'Verifica o status geral da API',
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.object({
              status: z.string(),
              timestamp: z.string(),
              uptime: z.number(),
              version: z.string(),
            }),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          503: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const startTime = Date.now()

      // Verificar conectividade do Redis
      const redisConnected = await isRedisConnected()

      const healthData = {
        status: redisConnected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.API_VERSION || '1.0.0',
        services: {
          redis: redisConnected ? 'connected' : 'disconnected',
        },
      }

      const statusCode = redisConnected ? 200 : 503

      return reply.status(statusCode).send({
        success: redisConnected,
        data: healthData,
        meta: {
          timestamp: Date.now(),
          version: process.env.API_VERSION || '1.0.0',
        },
      })
    },
  )

  // GET /health/redis - Status detalhado do Redis
  app.get(
    '/health/redis',
    {
      schema: {
        tags: ['🏥 Health'],
        summary: 'Redis Health Check',
        description: 'Verifica o status detalhado do Redis',
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.object({
              connected: z.boolean(),
              ping: z.string(),
              memory: z.record(z.string(), z.any()),
              stats: z.record(z.string(), z.any()),
              cache: z.object({
                totalKeys: z.number(),
                info: z.record(z.string(), z.any()),
              }),
            }),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          503: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const redisConnected = await isRedisConnected()

        if (!redisConnected) {
          return reply.status(503).send({
            success: false,
            message: 'Redis não está conectado',
            meta: {
              timestamp: Date.now(),
              version: process.env.API_VERSION || '1.0.0',
            },
          })
        }

        // Obter informações detalhadas do Redis
        const ping = await redisUtils.ping()
        const memoryStats = await redisUtils.memoryStats()
        const commandStats = await redisUtils.commandStats()
        const cacheStats = await redisCacheUtils.getStats()

        const redisData = {
          connected: true,
          ping,
          memory: memoryStats,
          stats: commandStats,
          cache: cacheStats,
        }

        return reply.status(200).send({
          success: true,
          data: redisData,
          meta: {
            timestamp: Date.now(),
            version: process.env.API_VERSION || '1.0.0',
          },
        })
      } catch (error: any) {
        return reply.status(503).send({
          success: false,
          message: `Erro ao verificar Redis: ${error.message}`,
          meta: {
            timestamp: Date.now(),
            version: process.env.API_VERSION || '1.0.0',
          },
        })
      }
    },
  )

  // GET /health/performance - Métricas de performance
  app.get(
    '/health/performance',
    {
      schema: {
        tags: ['🏥 Health'],
        summary: 'Performance Metrics',
        description: 'Retorna métricas de performance da API',
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.object({
              totalRequests: z.number(),
              averageResponseTime: z.string(),
              slowestEndpoints: z.array(
                z.object({
                  endpoint: z.string(),
                  count: z.number(),
                  avgDuration: z.string(),
                }),
              ),
              recentRequests: z.array(
                z.object({
                  method: z.string(),
                  url: z.string(),
                  duration: z.string(),
                  statusCode: z.number(),
                  timestamp: z.string(),
                }),
              ),
            }),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const performanceReport = performanceUtils.generateReport()

      return reply.status(200).send({
        success: true,
        data: performanceReport,
        meta: {
          timestamp: Date.now(),
          version: process.env.API_VERSION || '1.0.0',
        },
      })
    },
  )

  // POST /health/cache/clear - Limpar cache
  app.post(
    '/health/cache/clear',
    {
      schema: {
        tags: ['🏥 Health'],
        summary: 'Clear Cache',
        description: 'Limpa todo o cache Redis',
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
          503: z.object({
            success: z.boolean(),
            message: z.string(),
            meta: z.object({
              timestamp: z.number(),
              version: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        await redisCacheUtils.clearAll()

        return reply.status(200).send({
          success: true,
          message: 'Cache limpo com sucesso',
          meta: {
            timestamp: Date.now(),
            version: process.env.API_VERSION || '1.0.0',
          },
        })
      } catch (error: any) {
        return reply.status(503).send({
          success: false,
          message: `Erro ao limpar cache: ${error.message}`,
          meta: {
            timestamp: Date.now(),
            version: process.env.API_VERSION || '1.0.0',
          },
        })
      }
    },
  )
}
