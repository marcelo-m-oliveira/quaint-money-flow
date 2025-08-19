# Módulo de Cartões de Crédito (Credit Cards)

Este módulo implementa o CRUD completo para gerenciamento de cartões de crédito, seguindo os princípios de Clean Architecture e boas práticas de desenvolvimento, **padronizado conforme o módulo de Contas**.

## 📁 Estrutura do Módulo

```
src/
├── controllers/
│   ├── credit-card.controller.ts     # Controlador HTTP
│   └── __tests__/
│       └── credit-card.controller.test.ts
├── services/
│   ├── credit-card.service.ts        # Lógica de negócio
│   └── __tests__/
│       └── credit-card.service.test.ts
├── repositories/
│   ├── credit-card.repository.ts     # Acesso a dados
│   └── __tests__/
│       └── credit-card.repository.test.ts
├── factories/
│   └── credit-card.factory.ts        # Injeção de dependências
└── routes/
    └── credit-cards.ts               # Definição das rotas
```

## 🏗️ Arquitetura

### Camadas da Aplicação

1. **Controller Layer** (`credit-card.controller.ts`)
   - Responsável por receber requisições HTTP
   - Validação de entrada
   - Formatação de resposta usando `convertDatesToSeconds`
   - Tratamento de erros HTTP
   - Herda de `BaseController`

2. **Service Layer** (`credit-card.service.ts`)
   - Contém a lógica de negócio
   - Validações de regras de negócio
   - Orquestração entre diferentes repositórios
   - Tratamento de erros de domínio
   - Herda de `BaseService`
   - Logging de operações

3. **Repository Layer** (`credit-card.repository.ts`)
   - Abstração do acesso a dados
   - Operações CRUD básicas herdadas de `BaseRepository`
   - Queries específicas do domínio
   - Isolamento da tecnologia de persistência

4. **Factory Layer** (`credit-card.factory.ts`)
   - Gerenciamento de dependências
   - Padrão Singleton para instâncias
   - Facilita testes e manutenção

## 🔧 Funcionalidades Implementadas

### Endpoints Disponíveis

- `GET /credit-cards` - Listar cartões com paginação e filtros
- `GET /credit-cards/:id` - Buscar cartão por ID
- `POST /credit-cards` - Criar novo cartão
- `PUT /credit-cards/:id` - Atualizar cartão existente
- `DELETE /credit-cards/:id` - Excluir cartão
- `GET /credit-cards/:id/usage` - Obter uso do cartão
- `GET /credit-cards/select-options` - Opções para select

### Middlewares Aplicados

- **Autenticação**: `authMiddleware`
- **Performance**: `performanceMiddleware`
- **Rate Limiting**: `rateLimitMiddlewares`
- **Cache**: `redisCacheMiddlewares`
- **Validação**: `validateBody`, `validateParams`, `validateQuery`

## 🔄 Padronização com Módulo de Contas

### Mudanças Implementadas

1. **Service Layer**
   - ✅ Estende `BaseService<'creditCard'>`
   - ✅ Usa métodos herdados (`calculatePagination`, `logOperation`)
   - ✅ Implementa logging consistente
   - ✅ Validações padronizadas

2. **Repository Layer**
   - ✅ Estende `BaseRepository<'creditCard'>`
   - ✅ Usa métodos herdados (CRUD básico)
   - ✅ Métodos específicos de negócio mantidos
   - ✅ Padrão de nomenclatura consistente

3. **Controller Layer**
   - ✅ Usa `convertDatesToSeconds` e `convertArrayDatesToSeconds`
   - ✅ Formatação de resposta padronizada
   - ✅ Tratamento de erros consistente
   - ✅ Interface de filtros padronizada

4. **Rotas**
   - ✅ Middlewares completos (performance, cache, rate limit, validação)
   - ✅ Schemas de resposta padronizados
   - ✅ Documentação OpenAPI consistente
   - ✅ Tratamento de erros padronizado

### Funcionalidades Específicas Mantidas

- **Cálculo de Uso**: Mantido o cálculo específico de uso do cartão
- **Conta de Pagamento**: Relacionamento com conta de pagamento padrão
- **Limite de Crédito**: Conversão de string para number
- **Dias de Fatura**: `closingDay` e `dueDay` específicos do cartão

## 🧪 Testes

O módulo inclui testes para todas as camadas:

- **Controller Tests**: Testes de endpoints HTTP
- **Service Tests**: Testes de lógica de negócio
- **Repository Tests**: Testes de acesso a dados

## 📊 Métricas e Logging

- **Logging de Operações**: Todas as operações CRUD são logadas
- **Performance**: Middleware de performance aplicado
- **Cache**: Cache Redis para operações de leitura
- **Rate Limiting**: Proteção contra abuso

## 🔒 Segurança

- **Autenticação**: Todas as rotas requerem autenticação
- **Autorização**: Usuários só acessam seus próprios cartões
- **Validação**: Validação rigorosa de entrada
- **Rate Limiting**: Proteção contra ataques de força bruta

## 🚀 Como Usar

```typescript
// Exemplo de uso do service
const creditCardService = CreditCardFactory.getService()

// Criar cartão
const newCard = await creditCardService.create({
  name: 'Nubank',
  limit: '5000.00',
  closingDay: 15,
  dueDay: 25,
  icon: 'credit-card',
  iconType: 'generic'
}, userId)

// Buscar cartões
const cards = await creditCardService.findMany(userId, {
  search: 'nubank',
  page: 1,
  limit: 20
})

// Obter uso
const usage = await creditCardService.getUsage(cardId, userId)
```

## 📝 Notas de Implementação

- **Conversão de Limite**: O campo `limit` é convertido de string para number
- **Cálculo de Uso**: Baseado apenas em transações de despesa (`type: 'expense'`)
- **Validações**: Nome único por usuário, conta de pagamento válida
- **Exclusão**: Impede exclusão de cartões com transações
- **Cache**: Cache específico para uso do cartão (2 minutos)
