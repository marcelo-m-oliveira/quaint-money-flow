import { FastifyReply, FastifyRequest } from 'fastify'

interface PerformanceMetrics {
  requestId: string
  method: string
  url: string
  userId?: string
  startTime: number
  endTime?: number
  duration?: number
  statusCode?: number
  userAgent?: string
  ip?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 1000 // Manter apenas as últimas 1000 métricas

  addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric)

    // Manter apenas as métricas mais recentes
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0

    const totalDuration = this.metrics.reduce((sum, metric) => {
      return sum + (metric.duration || 0)
    }, 0)

    return totalDuration / this.metrics.length
  }

  getMetricsByEndpoint(): Record<
    string,
    { count: number; avgDuration: number }
  > {
    const endpointMetrics: Record<
      string,
      { count: number; totalDuration: number }
    > = {}

    this.metrics.forEach((metric) => {
      const key = `${metric.method} ${metric.url}`

      if (!endpointMetrics[key]) {
        endpointMetrics[key] = { count: 0, totalDuration: 0 }
      }

      endpointMetrics[key].count++
      endpointMetrics[key].totalDuration += metric.duration || 0
    })

    // Calcular média por endpoint
    const result: Record<string, { count: number; avgDuration: number }> = {}

    Object.entries(endpointMetrics).forEach(([endpoint, data]) => {
      result[endpoint] = {
        count: data.count,
        avgDuration: data.totalDuration / data.count,
      }
    })

    return result
  }

  clear(): void {
    this.metrics = []
  }
}

const performanceMonitor = new PerformanceMonitor()

export const performanceMiddleware = () => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now()
    const requestId = generateRequestId()

    // Criar métrica inicial
    const metric: PerformanceMetrics = {
      requestId,
      method: request.method,
      url: request.url,
      userId: (request as any).user?.sub,
      startTime,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    }

    // Adicionar request ID ao contexto
    ;(request as any).requestId = requestId

    // Interceptar o final da resposta
    const originalSend = reply.send

    reply.send = function (payload: any) {
      const endTime = Date.now()
      const duration = endTime - startTime

      // Atualizar métrica
      metric.endTime = endTime
      metric.duration = duration
      metric.statusCode = reply.statusCode

      // Adicionar métrica ao monitor
      performanceMonitor.addMetric(metric)

      // Log de performance (apenas para requisições lentas)
      if (duration > 1000) {
        // Mais de 1 segundo
        request.log.warn(
          {
            requestId,
            method: request.method,
            url: request.url,
            duration,
            userId: (request as any).user?.sub,
          },
          'Requisição lenta detectada',
        )
      }

      // Adicionar headers de performance
      reply.header('X-Request-ID', requestId)
      reply.header('X-Response-Time', `${duration}ms`)

      return originalSend.call(this, payload)
    }
  }
}

// Gerar ID único para requisição
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Middleware simplificado para monitorar uso de memória
export const memoryUsageMiddleware = () => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const startMemory = process.memoryUsage()

    // Monitorar memória no final da requisição
    const checkMemory = () => {
      const endMemory = process.memoryUsage()
      const memoryDiff = {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external,
      }

      // Log se uso de memória for alto
      if (memoryDiff.heapUsed > 10 * 1024 * 1024) {
        // Mais de 10MB
        request.log.warn(
          {
            requestId: (request as any).requestId,
            method: request.method,
            url: request.url,
            memoryDiff: {
              rss: `${(memoryDiff.rss / 1024 / 1024).toFixed(2)}MB`,
              heapUsed: `${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)}MB`,
            },
          },
          'Alto uso de memória detectado',
        )
      }
    }

    // Verificar memória após um delay
    setTimeout(checkMemory, 100)
  }
}

// Utilitários para acessar métricas de performance
export const performanceUtils = {
  getMetrics: () => performanceMonitor.getMetrics(),
  getAverageResponseTime: () => performanceMonitor.getAverageResponseTime(),
  getMetricsByEndpoint: () => performanceMonitor.getMetricsByEndpoint(),
  clear: () => performanceMonitor.clear(),

  // Gerar relatório de performance
  generateReport: () => {
    const metrics = performanceMonitor.getMetrics()
    const avgResponseTime = performanceMonitor.getAverageResponseTime()
    const endpointMetrics = performanceMonitor.getMetricsByEndpoint()

    return {
      totalRequests: metrics.length,
      averageResponseTime: `${avgResponseTime.toFixed(2)}ms`,
      slowestEndpoints: Object.entries(endpointMetrics)
        .sort(([, a], [, b]) => b.avgDuration - a.avgDuration)
        .slice(0, 5)
        .map(([endpoint, data]) => ({
          endpoint,
          count: data.count,
          avgDuration: `${data.avgDuration.toFixed(2)}ms`,
        })),
      recentRequests: metrics.slice(-10).map((metric) => ({
        method: metric.method,
        url: metric.url,
        duration: `${metric.duration?.toFixed(2)}ms`,
        statusCode: metric.statusCode,
        timestamp: new Date(metric.startTime).toISOString(),
      })),
    }
  },
}
