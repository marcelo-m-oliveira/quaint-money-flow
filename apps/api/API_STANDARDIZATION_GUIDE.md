# Guia de Padronização da API - Quaint Money Flow

## 📋 Visão Geral

Este documento estabelece os padrões e melhores práticas para a API do Quaint Money Flow, garantindo consistência, manutenibilidade e escalabilidade.

## 🏗️ Arquitetura e Estrutura

### Estrutura de Diretórios Padronizada

```
src/
├── http/
│   ├── controllers/          # Controladores da API
│   │   ├── base.controller.ts
│   │   └── [entity].controller.ts
│   ├── middlewares/          # Middlewares customizados
│   │   ├── auth.ts
│   │   ├── cache.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/              # Definição de rotas
│   │   ├── _errors/         # Classes de erro customizadas
│   │   └── [entity].ts
│   └── server.ts
├── services/                # Lógica de negócio
│   ├── base.service.ts
│   └── [entity].service.ts
├── repositories/            # Acesso a dados
│   ├── base.repository.ts
│   └── [entity].repository.ts
├── factories/              # Injeção de dependências
│   └── [entity].factory.ts
├── utils/                  # Utilitários
│   ├── response.ts
│   ├── errors.ts
│   └── schemas.ts
└── lib/                    # Configurações e bibliotecas
    ├── prisma.ts
    └── swagger.ts
```

## 📡 Padrões de Response

### Formato Padronizado de Response

Todas as respostas da API seguem o formato:

```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta?: {
    timestamp: number
    version: string
  }
}
```

### Exemplos de Response

#### Sucesso Simples
```json
{
  "success": true,
  "data": {
    "id": "clx123",
    "name": "Conta Principal",
    "balance": 1500.00
  },
  "message": "Conta criada com sucesso",
  "meta": {
    "timestamp": 1703123456789,
    "version": "1.0.0"
  }
}
```

#### Lista Paginada
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123",
      "name": "Conta Principal",
      "balance": 1500.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": 1703123456789,
    "version": "1.0.0"
  }
}
```

#### Erro de Validação
```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": {
    "name": ["Nome é obrigatório"],
    "type": ["Tipo deve ser bank, investment, cash ou other"]
  },
  "meta": {
    "timestamp": 1703123456789,
    "version": "1.0.0"
  }
}
```

## 🎯 Padrões de Controller

### Base Controller

Todos os controllers devem estender `BaseController`:

```typescript
export class AccountController extends BaseController {
  constructor(private accountService: AccountService) {
    super({ entityName: 'Conta', entityNamePlural: 'Contas' })
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    return this.handlePaginatedRequest(
      request,
      reply,
      async () => {
        // Lógica do controller
        return { items: data, pagination: paginationInfo }
      },
      'Listagem de contas'
    )
  }
}
```

### Métodos Padronizados

- `handleRequest()` - Para operações simples
- `handlePaginatedRequest()` - Para listagens paginadas
- `handleCreateRequest()` - Para criação
- `handleUpdateRequest()` - Para atualização
- `handleDeleteRequest()` - Para exclusão

## 🔧 Padrões de Service

### Base Service

Todos os services devem estender `BaseService`:

```typescript
export class AccountService extends BaseService<'account'> {
  constructor(
    accountRepository: AccountRepository,
    prisma: PrismaClient,
  ) {
    super(accountRepository, prisma)
  }

  async findMany(userId: string, filters: AccountFilters): Promise<PaginatedData<Account>> {
    // Implementação usando métodos da classe base
    return {
      items: accounts,
      pagination: this.calculatePagination(total, page, limit)
    }
  }
}
```

### Métodos Úteis da Base Service

- `calculatePagination()` - Calcula informações de paginação
- `validateUserOwnership()` - Valida propriedade do usuário
- `findByIdOrThrow()` - Busca por ID ou lança erro
- `validateUniqueConstraint()` - Valida unicidade
- `validateForeignKey()` - Valida chaves estrangeiras
- `sanitizeData()` - Sanitiza dados de entrada
- `withTransaction()` - Executa operações em transação

## 🗄️ Padrões de Repository

### Base Repository

Todos os repositories devem estender `BaseRepository`:

```typescript
export class AccountRepository extends BaseRepository<'account'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'account')
  }

  async getAccountsWithBalance(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      include: {
        entries: true
      }
    })
  }
}
```

### Métodos Úteis da Base Repository

- `findWithPagination()` - Busca com paginação
- `findByIds()` - Busca múltiplos por IDs
- `exists()` - Verifica existência
- `upsert()` - Cria ou atualiza
- `aggregate()` - Agregações
- `groupBy()` - Agrupamentos

## 🔒 Padrões de Validação

### Middleware de Validação

```typescript
// Validação de body
app.post('/accounts', {
  preHandler: [validateBody(accountCreateSchema)]
})

// Validação de query params
app.get('/accounts', {
  preHandler: [validateQuery(accountFiltersSchema)]
})

// Validação de path params
app.get('/accounts/:id', {
  preHandler: [validateParams(idParamSchema)]
})
```

### Schemas de Validação

Todos os schemas devem ser definidos no package `@saas/validations`:

```typescript
export const accountCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['bank', 'investment', 'cash', 'other']),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  iconType: z.enum(['bank', 'generic']).default('generic'),
  includeInGeneralBalance: z.boolean().default(true)
})
```

## 💾 Padrões de Cache

### Middleware de Cache

```typescript
// Cache para GET requests
app.get('/accounts', {
  preHandler: [cacheUtils.forGetRequests(300)] // 5 minutos
})

// Cache específico para dados do usuário
app.get('/accounts', {
  preHandler: [cacheUtils.forUserData(300)]
})

// Cache para dados públicos
app.get('/public/categories', {
  preHandler: [cacheUtils.forPublicData(600)] // 10 minutos
})
```

### Invalidação de Cache

```typescript
// Invalidar cache ao criar/atualizar/deletar
await accountService.create(userId, data)
invalidateAccountCache(userId)
```

## 🚨 Padrões de Tratamento de Erro

### Classes de Erro Customizadas

```typescript
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BadRequestError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}
```

### Tratamento Centralizado

```typescript
export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return ResponseFormatter.error(
      reply,
      'Erro de validação',
      error.flatten().fieldErrors,
      400
    )
  }

  if (error instanceof BadRequestError) {
    return ResponseFormatter.error(reply, error.message, undefined, 400)
  }

  // ... outros tipos de erro

  return ResponseFormatter.error(reply, 'Erro interno do servidor', undefined, 500)
}
```

## 📊 Padrões de Logging

### Logging Estruturado

```typescript
// No controller
request.log.info({ userId, operation: 'create_account' }, 'Criando conta')

// No service
this.logOperation('create', userId, { accountId: account.id, accountName: account.name })
```

### Níveis de Log

- `error` - Erros que precisam de atenção imediata
- `warn` - Situações que podem causar problemas
- `info` - Informações gerais de operação
- `debug` - Informações detalhadas para debugging

## 🔄 Padrões de Paginação

### Query Parameters Padronizados

```typescript
interface PaginationQuery {
  page?: number    // Página atual (padrão: 1)
  limit?: number   // Itens por página (padrão: 20, máximo: 100)
}
```

### Response de Paginação

```typescript
interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
```

## 📅 Padrões de Data

### Conversão de Datas

Todas as datas são convertidas para timestamp em segundos:

```typescript
// Utilitário para conversão
export const convertDatesToSeconds = <T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[] = ['createdAt', 'updatedAt', 'date']
): T => {
  // Implementação
}

// Uso
const accountWithConvertedDates = convertDatesToSeconds(account)
const accountsWithConvertedDates = convertArrayDatesToSeconds(accounts)
```

## 🏭 Padrões de Factory

### Injeção de Dependências

```typescript
export class AccountFactory {
  private static accountRepository: AccountRepository
  private static accountService: AccountService
  private static accountController: AccountController

  static getRepository(): AccountRepository {
    if (!this.accountRepository) {
      this.accountRepository = new AccountRepository(prisma)
    }
    return this.accountRepository
  }

  static getService(): AccountService {
    if (!this.accountService) {
      const repository = this.getRepository()
      this.accountService = new AccountService(repository, prisma)
    }
    return this.accountService
  }

  static getController(): AccountController {
    if (!this.accountController) {
      const service = this.getService()
      this.accountController = new AccountController(service)
    }
    return this.accountController
  }
}
```

## 🧪 Padrões de Teste

### Estrutura de Testes

```
__tests__/
├── controllers/
│   └── [entity].controller.test.ts
├── services/
│   └── [entity].service.test.ts
├── repositories/
│   └── [entity].repository.test.ts
└── integration/
    └── [feature].integration.test.ts
```

### Exemplo de Teste de Controller

```typescript
describe('AccountController', () => {
  let accountController: AccountController
  let accountService: jest.Mocked<AccountService>

  beforeEach(() => {
    accountService = createMockAccountService()
    accountController = new AccountController(accountService)
  })

  describe('index', () => {
    it('should return paginated accounts', async () => {
      // Test implementation
    })
  })
})
```

## 📈 Métricas e Monitoramento

### Headers de Response

```typescript
// Cache status
reply.header('X-Cache', 'HIT' | 'MISS')

// Request ID para tracing
reply.header('X-Request-ID', requestId)

// API version
reply.header('X-API-Version', '1.0.0')
```

### Logs de Performance

```typescript
// Log de tempo de resposta
const startTime = Date.now()
// ... operação
const duration = Date.now() - startTime
request.log.info({ duration, operation: 'account_list' }, 'Operação concluída')
```

## 🔄 Migração e Implementação

### Fase 1: Infraestrutura Base
1. ✅ Implementar `ResponseFormatter`
2. ✅ Criar `BaseController`
3. ✅ Criar `BaseService`
4. ✅ Melhorar `BaseRepository`
5. ✅ Implementar middlewares de cache e validação

### Fase 2: Refatoração Gradual
1. Refatorar controllers existentes para usar `BaseController`
2. Refatorar services existentes para usar `BaseService`
3. Implementar novos padrões de response
4. Adicionar cache onde apropriado

### Fase 3: Otimizações
1. Implementar métricas de performance
2. Otimizar queries do banco de dados
3. Implementar rate limiting
4. Adicionar documentação automática

## 📚 Recursos Adicionais

- [Fastify Documentation](https://www.fastify.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod Documentation](https://zod.dev/)
- [REST API Design Best Practices](https://restfulapi.net/)

---

**Nota**: Este guia deve ser atualizado conforme a evolução da API e novas necessidades do projeto.
