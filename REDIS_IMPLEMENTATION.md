# 🚀 Implementação do Redis na API

## 📋 Visão Geral

Este documento descreve a implementação completa do Redis como solução de cache distribuído para a API, substituindo o cache em memória anterior e proporcionando melhor escalabilidade e performance.

## 🏗️ Arquitetura

### Componentes Principais

1. **Redis Server** - Servidor Redis configurado no Docker
2. **Redis Client** - Cliente ioredis para conexão
3. **Cache Middleware** - Middleware para gerenciar cache
4. **Health Monitoring** - Endpoints para monitoramento

### Estrutura de Arquivos

```
apps/api/src/
├── lib/
│   └── redis.ts                    # Configuração e conexão Redis
├── middleware/
│   └── redis-cache.middleware.ts   # Middleware de cache Redis
└── http/
    └── routes/
        └── health.ts               # Endpoints de monitoramento
```

## 🐳 Configuração Docker

### Docker Compose Atualizado

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - quaint-money-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Configurações do Redis

- **Persistência**: AOF (Append Only File) habilitado
- **Memória Máxima**: 256MB
- **Política de Evicção**: LRU (Least Recently Used)
- **Health Check**: Ping a cada 30 segundos

## 🔧 Configuração do Cliente

### Variáveis de Ambiente

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Configurações de Conexão

```typescript
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
  enableReadyCheck: true,
  maxLoadingTimeout: 10000,
}
```

## 🎯 Middleware de Cache

### Tipos de Cache Disponíveis

| Tipo | TTL | Prefixo | Uso |
|------|-----|---------|-----|
| `list` | 5 min | `api:list` | Listagens |
| `detail` | 10 min | `api:detail` | Detalhes |
| `balance` | 2 min | `api:balance` | Saldos |
| `report` | 15 min | `api:report` | Relatórios |
| `selectOptions` | 30 min | `api:select` | Opções de select |

### Uso nas Rotas

```typescript
// Cache para listagem
preHandler: [
  authMiddleware,
  performanceMiddleware(),
  redisCacheMiddlewares.list(),
  rateLimitMiddlewares.authenticated(),
]

// Cache para detalhes
preHandler: [
  authMiddleware,
  performanceMiddleware(),
  redisCacheMiddlewares.detail(),
  rateLimitMiddlewares.authenticated(),
]

// Cache para saldos
preHandler: [
  authMiddleware,
  performanceMiddleware(),
  redisCacheMiddlewares.balance(),
  rateLimitMiddlewares.authenticated(),
]
```

## 🔄 Invalidação de Cache

### Funções de Invalidação

```typescript
// Invalidar cache de contas
await invalidateAccountCache(userId, accountId?)

// Invalidar cache de categorias
await invalidateCategoryCache(userId)

// Invalidar cache de cartões
await invalidateCreditCardCache(userId, cardId?)

// Invalidar cache de lançamentos
await invalidateEntryCache(userId)

// Invalidar cache de relatórios
await invalidateReportCache(userId)
```

### Padrões de Invalidação

- **Contas**: `api:cache:*accounts*:${userId}*`
- **Categorias**: `api:cache:*categories*:${userId}*`
- **Cartões**: `api:cache:*credit-cards*:${userId}*`
- **Lançamentos**: `api:cache:*entries*:${userId}*`
- **Relatórios**: `api:cache:*reports*:${userId}*`

## 📊 Monitoramento

### Endpoints de Health Check

#### 1. Health Check Geral
```
GET /api/v1/health
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "services": {
      "redis": "connected"
    }
  }
}
```

#### 2. Status Detalhado do Redis
```
GET /api/v1/health/redis
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "ping": "PONG",
    "memory": {
      "used_memory": "1048576",
      "used_memory_peak": "2097152"
    },
    "stats": {
      "total_commands_processed": "1000",
      "total_connections_received": "50"
    },
    "cache": {
      "totalKeys": 25,
      "info": { ... }
    }
  }
}
```

#### 3. Métricas de Performance
```
GET /api/v1/health/performance
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalRequests": 1000,
    "averageResponseTime": "45.23ms",
    "slowestEndpoints": [
      {
        "endpoint": "GET /accounts",
        "count": 100,
        "avgDuration": "120.45ms"
      }
    ],
    "recentRequests": [...]
  }
}
```

#### 4. Limpar Cache
```
POST /api/v1/health/cache/clear
```

## 🚀 Benefícios da Implementação

### 1. Escalabilidade
- **Cache Distribuído**: Múltiplas instâncias da API compartilham o mesmo cache
- **Persistência**: Dados sobrevivem a reinicializações
- **Cluster Ready**: Preparado para configuração em cluster

### 2. Performance
- **Redução de Latência**: Cache em memória externa
- **Menos Queries**: Redução de consultas ao banco de dados
- **TTL Otimizado**: Diferentes tempos de vida por tipo de dado

### 3. Observabilidade
- **Headers de Cache**: `X-Cache`, `X-Cache-Key`
- **Métricas Detalhadas**: Estatísticas de uso e performance
- **Health Checks**: Monitoramento em tempo real

### 4. Flexibilidade
- **Fallback Graceful**: Funciona sem Redis (modo degradado)
- **Configuração Dinâmica**: TTL e prefixos configuráveis
- **Invalidação Inteligente**: Padrões específicos por entidade

## 🔧 Comandos Úteis

### Docker
```bash
# Iniciar serviços
docker-compose up -d

# Ver logs do Redis
docker-compose logs redis

# Acessar CLI do Redis
docker-compose exec redis redis-cli

# Parar serviços
docker-compose down
```

### Redis CLI
```bash
# Conectar ao Redis
redis-cli

# Ver informações
INFO

# Ver estatísticas de memória
INFO memory

# Ver chaves de cache
KEYS api:cache:*

# Limpar cache
FLUSHALL

# Ver TTL de uma chave
TTL api:cache:key
```

## 📈 Métricas e Monitoramento

### Headers de Resposta
- `X-Cache`: `HIT` ou `MISS`
- `X-Cache-Key`: Chave do cache utilizada
- `X-Response-Time`: Tempo de resposta
- `X-Request-ID`: ID único da requisição

### Logs
- Conexão/desconexão do Redis
- Erros de cache
- Requisições lentas (>1s)
- Alto uso de memória (>10MB)

## 🔒 Segurança

### Configurações de Segurança
- **Autenticação**: Suporte a senha (opcional)
- **Isolamento**: Database separado por ambiente
- **Rate Limiting**: Proteção contra abuso
- **Validação**: Sanitização de dados

### Boas Práticas
- Sempre usar TTL para evitar vazamentos de memória
- Invalidar cache após operações de escrita
- Monitorar uso de memória
- Usar prefixos para organização

## 🚀 Próximos Passos

### Melhorias Futuras
1. **Redis Cluster**: Para alta disponibilidade
2. **Cache Warming**: Pré-carregamento de dados
3. **Compressão**: Reduzir uso de memória
4. **Analytics**: Dashboard de métricas
5. **Backup**: Estratégia de backup automático

### Integração com Outros Serviços
1. **Prometheus**: Métricas estruturadas
2. **Grafana**: Dashboards visuais
3. **Alerting**: Alertas de performance
4. **Logs**: Centralização de logs

## 📚 Referências

- [Redis Documentation](https://redis.io/documentation)
- [ioredis Documentation](https://github.com/luin/ioredis)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [Docker Redis](https://hub.docker.com/_/redis)

---

**Status**: ✅ Implementado e Funcionando  
**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2024
