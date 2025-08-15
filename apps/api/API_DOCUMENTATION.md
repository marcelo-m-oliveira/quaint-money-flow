# 📚 Documentação da API - Quaint Money Flow

## 🚀 Visão Geral

A API do Quaint Money Flow é uma solução completa para gerenciamento financeiro pessoal, oferecendo endpoints organizados para controle de transações, relatórios, contas, cartões e configurações.

## 🔐 Autenticação

### Bearer Token
A API utiliza autenticação Bearer Token. Para desenvolvimento, use qualquer token válido.

**Exemplo:**
```bash
Authorization: Bearer dev-token
```

### Como Autorizar no Swagger UI
1. Acesse a documentação: `http://localhost:3333/docs`
2. Clique no botão **"Authorize"** no topo da página
3. Insira `dev-token` no campo de valor
4. Clique em **"Authorize"**

## 📋 Organização dos Endpoints

### 📈 Relatórios
Endpoints para geração de relatórios financeiros detalhados:

- **GET** `/api/v1/reports/categories` - Relatório de categorias com hierarquia
- **GET** `/api/v1/reports/cashflow` - Relatório de fluxo de caixa com agrupamento temporal
- **GET** `/api/v1/reports/accounts` - Relatório de contas e cartões com filtros

### 💰 Transações
CRUD completo de entradas e saídas financeiras:

- **GET** `/api/v1/entries` - Listar transações com filtros avançados
- **GET** `/api/v1/entries/:id` - Buscar transação específica
- **POST** `/api/v1/entries` - Criar nova transação
- **PUT** `/api/v1/entries/:id` - Atualizar transação
- **PATCH** `/api/v1/entries/:id` - Atualizar transação parcialmente
- **DELETE** `/api/v1/entries/:id` - Excluir transação

### 🏦 Contas
Operações relacionadas a contas bancárias:

- **GET** `/api/v1/accounts` - Listar contas com filtros
- **GET** `/api/v1/accounts/:id` - Buscar conta específica
- **POST** `/api/v1/accounts` - Criar nova conta
- **PUT** `/api/v1/accounts/:id` - Atualizar conta
- **DELETE** `/api/v1/accounts/:id` - Excluir conta
- **GET** `/api/v1/accounts/:id/balance` - Saldo da conta
- **GET** `/api/v1/accounts/select-options` - Opções para select

### 💳 Cartões
Gerenciamento de cartões de crédito:

- **GET** `/api/v1/credit-cards` - Listar cartões
- **GET** `/api/v1/credit-cards/:id` - Buscar cartão específico
- **POST** `/api/v1/credit-cards` - Criar novo cartão
- **PUT** `/api/v1/credit-cards/:id` - Atualizar cartão
- **DELETE** `/api/v1/credit-cards/:id` - Excluir cartão
- **GET** `/api/v1/credit-cards/:id/usage` - Uso do cartão
- **GET** `/api/v1/credit-cards/select-options` - Opções para select

### 📂 Categorias
Organização de transações por categorias e subcategorias:

- **GET** `/api/v1/categories` - Listar categorias com hierarquia
- **GET** `/api/v1/categories/:id` - Buscar categoria específica
- **POST** `/api/v1/categories` - Criar categoria ou subcategoria
- **PUT** `/api/v1/categories/:id` - Atualizar categoria
- **DELETE** `/api/v1/categories/:id` - Excluir categoria
- **GET** `/api/v1/categories/select-options` - Opções para select
- **GET** `/api/v1/categories/usage` - Indicadores de uso

### ⚙️ Configurações
Preferências e configurações do usuário:

- **GET** `/api/v1/user-preferences` - Buscar preferências
- **PATCH** `/api/v1/user-preferences` - Atualizar preferências (parcial)
- **POST** `/api/v1/user-preferences` - Criar/atualizar preferências (upsert)
- **POST** `/api/v1/user-preferences/reset` - Resetar preferências

### 📊 Visão Geral
Dashboard e resumos financeiros:

- **GET** `/api/v1/overview` - Resumo geral da situação financeira
- **GET** `/api/v1/overview/top-expenses` - Maiores gastos por categoria
- **GET** `/api/v1/overview/stats` - Estatísticas rápidas

## 🧪 Como Testar

### 1. Acesse a Documentação
```bash
http://localhost:3333/docs
```

### 2. Autorize-se
- Clique em **"Authorize"**
- Insira `dev-token`
- Clique em **"Authorize"**

### 3. Navegue pelas Tags
- Use as tags organizadas para encontrar endpoints específicos
- Cada tag contém endpoints relacionados

### 4. Teste os Endpoints
- Clique em um endpoint
- Clique em **"Try it out"**
- Preencha os parâmetros necessários
- Clique em **"Execute"**

## 📝 Exemplos de Uso

### Criar uma Transação
```bash
POST /api/v1/entries
Authorization: Bearer dev-token
Content-Type: application/json

{
  "amount": 150.50,
  "type": "expense",
  "date": "2025-01-15",
  "categoryId": "category-id",
  "accountId": "account-id",
  "description": "Compra no supermercado"
}
```

### Relatório de Fluxo de Caixa
```bash
GET /api/v1/reports/cashflow?startDate=1640995200&endDate=1643587200&viewMode=weekly
Authorization: Bearer dev-token
```

### Filtrar Contas Bancárias
```bash
GET /api/v1/reports/accounts?accountFilter=bank_accounts
Authorization: Bearer dev-token
```

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente
```bash
# API
PORT=3333
API_PREFIX=/api
API_VERSION=v1

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=/docs

# JWT
JWT_SECRET=your-secret-key
```

### Iniciar o Servidor
```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm build
pnpm start
```

## 📊 Códigos de Resposta

### Sucesso
- **200** - OK (GET, PUT, PATCH)
- **201** - Created (POST)
- **204** - No Content (DELETE)

### Erro do Cliente
- **400** - Bad Request (dados inválidos)
- **401** - Unauthorized (token inválido/missing)
- **404** - Not Found (recurso não encontrado)

### Erro do Servidor
- **500** - Internal Server Error

## 🎯 Funcionalidades Principais

### Relatórios Avançados
- **Agrupamento temporal**: Diário, semanal, mensal
- **Filtros por categoria**: Hierarquia pai/filho
- **Filtros por conta**: Bancárias vs cartões
- **Formatação de datas**: Padrão brasileiro

### Gestão de Transações
- **Filtros avançados**: Período, tipo, categoria, conta
- **Busca textual**: Descrição das transações
- **Paginação**: Controle de volume de dados
- **Ordenação**: Múltiplos campos

### Hierarquia de Categorias
- **Categorias pai**: Categorias principais
- **Subcategorias**: Categorias filhas
- **Múltiplos níveis**: Suporte a níveis aninhados
- **Agrupamento automático**: Relatórios hierárquicos

### Controle de Contas
- **Tipos variados**: Conta corrente, poupança, investimento
- **Cartões de crédito**: Limite, vencimento, uso
- **Saldos em tempo real**: Atualização automática
- **Filtros por tipo**: Separação bancária/cartão

## 🚀 Próximos Passos

1. **Teste todos os endpoints** usando o Swagger UI
2. **Explore os filtros** disponíveis em cada endpoint
3. **Experimente os relatórios** com diferentes agrupamentos
4. **Configure preferências** do usuário
5. **Integre com frontend** usando os endpoints organizados

---

**📞 Suporte**: Para dúvidas ou problemas, consulte a documentação completa no Swagger UI ou entre em contato com a equipe de desenvolvimento.
