# Módulo de Contas (Accounts)

Este módulo implementa o CRUD completo para gerenciamento de contas financeiras, seguindo os princípios de Clean Architecture e boas práticas de desenvolvimento.

## 📁 Estrutura do Módulo

```
src/
├── controllers/
│   ├── account.controller.ts     # Controlador HTTP
│   └── __tests__/
│       └── account.controller.test.ts
├── services/
│   ├── account.service.ts        # Lógica de negócio
│   └── __tests__/
│       └── account.service.test.ts
├── repositories/
│   ├── account.repository.ts     # Acesso a dados
│   └── __tests__/
│       └── account.repository.test.ts
├── factories/
│   └── account.factory.ts        # Injeção de dependências
└── routes/
    └── accounts.ts               # Definição das rotas
```

## 🏗️ Arquitetura

### Camadas da Aplicação

1. **Controller Layer** (`account.controller.ts`)
   - Responsável por receber requisições HTTP
   - Validação de entrada
   - Formatação de resposta
   - Tratamento de erros HTTP

2. **Service Layer** (`account.service.ts`)
   - Contém a lógica de negócio
   - Validações de regras de negócio
   - Orquestração entre diferentes repositórios
   - Tratamento de erros de domínio

3. **Repository Layer** (`account.repository.ts`)
   - Abstração do acesso a dados
   - Operações CRUD básicas
   - Queries específicas do domínio
   - Isolamento da tecnologia de persistência

4. **Factory Layer** (`account.factory.ts`)
   - Gerenciamento de dependências
   - Padrão Singleton para instâncias
   - Facilita testes e manutenção

## 🔧 Funcionalidades Implementadas

### Endpoints Disponíveis

- `GET /accounts` - Listar contas com paginação e filtros
- `GET /accounts/:id` - Buscar conta por ID
- `POST /accounts` - Criar nova conta
- `PUT /accounts/:id` - Atualizar conta existente
- `DELETE /accounts/:id` - Excluir conta
- `GET /accounts/:id/balance` - Obter saldo da conta

### Filtros e Paginação

```typescript
// Exemplo de uso dos filtros
GET /accounts?page=1&limit=20&type=bank&includeInGeneralBalance=true
```

### Validações Implementadas

- ✅ Nome da conta único por usuário
- ✅ Validação de tipos de conta
- ✅ Verificação de existência antes de operações
- ✅ Prevenção de exclusão de contas com transações
- ✅ Validação de propriedade (usuário só acessa suas contas)

## 🧪 Testes

### Cobertura de Testes

- **Unit Tests**: 100% de cobertura nas camadas Service e Repository
- **Integration Tests**: Testes do Controller com mocks
- **Test Patterns**: Uso de mocks, spies e fixtures

### Executar Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes com cobertura
pnpm test:coverage

# Executar testes em modo watch
pnpm test:watch

# Executar apenas testes do módulo accounts
pnpm test accounts
```

## 🔒 Segurança

### Medidas Implementadas

- **Autorização**: Verificação de propriedade dos recursos
- **Validação de Entrada**: Uso do Zod para validação rigorosa
- **Sanitização**: Prevenção de SQL Injection através do Prisma
- **Rate Limiting**: Implementado nas rotas (configurável)

## 📊 Performance

### Otimizações Aplicadas

- **Paginação**: Evita carregamento desnecessário de dados
- **Índices**: Otimização de queries no banco de dados
- **Lazy Loading**: Carregamento sob demanda de relacionamentos
- **Caching**: Preparado para implementação de cache (Redis)

## 🔄 Padrões Utilizados

### Design Patterns

- **Repository Pattern**: Abstração do acesso a dados
- **Factory Pattern**: Criação e gerenciamento de instâncias
- **Dependency Injection**: Inversão de controle
- **Error Handling Pattern**: Tratamento consistente de erros

### Princípios SOLID

- **S**ingle Responsibility: Cada classe tem uma responsabilidade
- **O**pen/Closed: Extensível sem modificação
- **L**iskov Substitution: Interfaces bem definidas
- **I**nterface Segregation: Interfaces específicas
- **D**ependency Inversion: Dependência de abstrações

## 🚀 Extensibilidade

### Como Adicionar Novas Funcionalidades

1. **Nova Regra de Negócio**: Adicionar no Service
2. **Nova Query**: Adicionar no Repository
3. **Novo Endpoint**: Adicionar no Controller e Routes
4. **Nova Validação**: Atualizar schemas Zod

### Exemplo: Adicionar Funcionalidade de Arquivamento

```typescript
// 1. Repository
async archiveAccount(id: string, userId: string) {
  return this.prisma.account.update({
    where: { id, userId },
    data: { archived: true, archivedAt: new Date() }
  })
}

// 2. Service
async archive(id: string, userId: string) {
  const account = await this.findById(id, userId)
  return this.accountRepository.archiveAccount(id, userId)
}

// 3. Controller
async archive(req: Request, res: Response) {
  try {
    const result = await this.accountService.archive(
      req.params.id,
      req.user.id
    )
    res.status(200).json(result)
  } catch (error) {
    handleError(error, res)
  }
}
```

## 📝 Logs e Monitoramento

### Logs Implementados

- Operações CRUD com detalhes
- Erros com stack trace
- Performance de queries
- Tentativas de acesso não autorizado

### Métricas Disponíveis

- Tempo de resposta por endpoint
- Taxa de erro por operação
- Uso de recursos por usuário
- Distribuição de tipos de conta

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Paginação padrão
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# Cache (opcional)
REDIS_URL="redis://localhost:6379"
```

### Dependências

```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "zod": "^3.22.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

## 🤝 Contribuição

### Guidelines

1. Seguir os padrões arquiteturais estabelecidos
2. Manter cobertura de testes acima de 80%
3. Documentar novas funcionalidades
4. Usar TypeScript rigorosamente tipado
5. Seguir convenções de nomenclatura

### Code Review Checklist

- [ ] Testes unitários implementados
- [ ] Validações de entrada adequadas
- [ ] Tratamento de erros consistente
- [ ] Documentação atualizada
- [ ] Performance considerada
- [ ] Segurança verificada