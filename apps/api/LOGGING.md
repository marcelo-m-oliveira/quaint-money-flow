# Sistema de Logging da API

Este documento descreve o sistema de logging implementado na API para melhorar a observabilidade e facilitar o debugging.

## 📋 Visão Geral

O sistema de logging foi implementado usando **Pino** (logger padrão do Fastify) com **pino-pretty** para formatação legível em desenvolvimento.

## 🎨 Características

### Formatação Colorida
- ✅ Logs coloridos em desenvolvimento
- ✅ Timestamps legíveis (HH:MM:ss Z)
- ✅ Emojis para identificação rápida (🚀)
- ✅ Informações estruturadas em JSON

### Níveis de Log
- **INFO**: Operações normais e fluxo da aplicação
- **WARN**: Situações de atenção (ex: token não fornecido)
- **ERROR**: Erros que precisam de investigação

## 🔧 Configuração

### Desenvolvimento
```typescript
const loggerConfig = {
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      messageFormat: '🚀 {msg}',
      levelFirst: true,
      singleLine: false,
    },
  },
}
```

### Produção
```typescript
const loggerConfig = {
  level: 'info',
}
```

## 📊 Logs Implementados

### 1. Inicialização do Servidor
```
INFO: 🚀 Servidor HTTP iniciado com sucesso
  port: 3333
  host: "0.0.0.0"
  environment: "development"
  apiVersion: "v1"
  apiPrefix: "/api"
  swaggerEnabled: true
  swaggerPath: "/docs"
```

### 2. Middleware de Autenticação
```
INFO: 🚀 Tentativa de autenticação
  method: "GET"
  url: "/api/v1/accounts"
  ip: "127.0.0.1"

INFO: 🚀 Autenticação realizada com sucesso
  userId: "cme3h2l970000iluwabmcwkv3"
  userEmail: "user@example.com"
```

### 3. Operações de Contas

#### Listagem
```
INFO: 🚀 Listando contas do usuário
  userId: "cme3h2l970000iluwabmcwkv3"
  filters: { "page": 1, "limit": 20 }

INFO: 🚀 Contas listadas com sucesso
  totalAccounts: 2
  totalPages: 1
```

#### Criação
```
INFO: 🚀 Criando nova conta
  userId: "cme3h2l970000iluwabmcwkv3"
  accountData: {
    "name": "Conta Teste Log",
    "type": "bank",
    "icon": "wallet",
    "iconType": "generic",
    "includeInGeneralBalance": true
  }

INFO: 🚀 Conta criada com sucesso
  accountId: "cme3q4mu90000hqxw5vwkylff"
  name: "Conta Teste Log"
```

#### Atualização
```
INFO: 🚀 Atualizando conta
  userId: "user-id"
  accountId: "account-id"
  updateData: { "name": "Novo Nome" }

INFO: 🚀 Conta atualizada com sucesso
  accountId: "account-id"
  name: "Novo Nome"
```

#### Exclusão
```
INFO: 🚀 Deletando conta
  userId: "user-id"
  accountId: "account-id"

INFO: 🚀 Conta deletada com sucesso
  accountId: "account-id"
```

### 4. Tratamento de Erros
```
ERROR: 🚀 Erro ao criar conta
  userId: "user-id"
  error: "Já existe uma conta com este nome"

WARN: 🚀 Token de acesso não fornecido
  method: "GET"
  url: "/api/v1/accounts"
  ip: "127.0.0.1"
```

## 🚀 Benefícios

1. **Debugging Facilitado**: Logs estruturados com contexto completo
2. **Rastreabilidade**: Request ID para acompanhar requisições
3. **Monitoramento**: Informações de performance (responseTime)
4. **Segurança**: Logs de tentativas de autenticação
5. **Operações**: Visibilidade completa do fluxo de dados

## 📈 Métricas Incluídas

- **Response Time**: Tempo de resposta das requisições
- **Status Codes**: Códigos de resposta HTTP
- **User Context**: ID e email do usuário autenticado
- **Request Context**: Método, URL, IP do cliente
- **Business Context**: IDs de recursos, dados de operações

## 🔍 Como Usar

Os logs são automaticamente gerados durante as operações da API. Para visualizar:

1. **Desenvolvimento**: Execute `pnpm dev` e os logs aparecerão coloridos no terminal
2. **Produção**: Os logs são gerados em formato JSON para processamento por ferramentas de observabilidade

## 🛠️ Extensão

Para adicionar logs em novos controladores:

```typescript
// Log de informação
request.log.info({ userId, data }, 'Operação iniciada')

// Log de erro
request.log.error({ userId, error: error.message }, 'Erro na operação')

// Log de warning
request.log.warn({ userId }, 'Situação de atenção')
```

## 📦 Dependências

- **pino**: Logger principal (incluído no Fastify)
- **pino-pretty**: Formatação para desenvolvimento
- **fastify**: Framework com logging integrado