import Redis from 'ioredis'

// Configuração do Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  // Configurações para cluster (se necessário)
  enableReadyCheck: true,
  maxLoadingTimeout: 10000,
}

// Instância do Redis
let redisClient: Redis | null = null

// Função para obter a instância do Redis
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisConfig)

    // Event listeners para monitoramento
    redisClient.on('connect', () => {
      console.log('✅ Redis conectado')
    })

    redisClient.on('error', (error) => {
      console.error('❌ Erro no Redis:', error)
    })

    redisClient.on('close', () => {
      console.log('🔌 Conexão Redis fechada')
    })

    redisClient.on('reconnecting', () => {
      console.log('🔄 Reconectando ao Redis...')
    })
  }

  return redisClient
}

// Função para fechar a conexão
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

// Função para verificar se o Redis está conectado
export async function isRedisConnected(): Promise<boolean> {
  try {
    const client = getRedisClient()
    await client.ping()
    return true
  } catch (error) {
    console.error('Redis não está conectado:', error)
    return false
  }
}

// Utilitários para operações comuns
export const redisUtils = {
  // Ping para verificar conectividade
  ping: async (): Promise<string> => {
    const client = getRedisClient()
    return await client.ping()
  },

  // Limpar todo o cache
  flushAll: async (): Promise<void> => {
    const client = getRedisClient()
    await client.flushall()
  },

  // Obter informações do Redis
  info: async (): Promise<string> => {
    const client = getRedisClient()
    return await client.info()
  },

  // Obter estatísticas de memória
  memoryStats: async (): Promise<Record<string, string>> => {
    const client = getRedisClient()
    const info = await client.info('memory')
    const lines = info.split('\r\n')
    const stats: Record<string, string> = {}

    lines.forEach((line) => {
      if (line.includes(':')) {
        const [key, value] = line.split(':')
        stats[key] = value
      }
    })

    return stats
  },

  // Obter estatísticas de comandos
  commandStats: async (): Promise<Record<string, string>> => {
    const client = getRedisClient()
    const info = await client.info('stats')
    const lines = info.split('\r\n')
    const stats: Record<string, string> = {}

    lines.forEach((line) => {
      if (line.includes(':')) {
        const [key, value] = line.split(':')
        stats[key] = value
      }
    })

    return stats
  },
}
