# 🚀 Guia de Build e Desenvolvimento - API

## 📋 Pré-requisitos

- **Node.js**: Versão 18 ou superior
- **pnpm**: Gerenciador de pacotes
- **PostgreSQL**: Banco de dados
- **Variáveis de ambiente**: Arquivo `.env` configurado

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Executar migrações do banco
pnpm db:migrate

# Abrir Prisma Studio
pnpm db:studio
```

### Build e Produção
```bash
# Build da aplicação
pnpm build

# Verificar tipos TypeScript
pnpm build:check

# Compilar apenas
pnpm build:compile

# Limpar build
pnpm build:clean

# Iniciar servidor de produção
pnpm start
```

### Qualidade de Código
```bash
# Lint e auto-correção
pnpm lint

# Verificar lint apenas
pnpm lint:check
```

### Testes
```bash
# Executar testes
pnpm test

# Testes em modo watch
pnpm test:watch

# Testes com cobertura
pnpm test:coverage
```

## 🏗️ Processo de Build

### 1. Verificação de Tipos
O build inclui verificação de tipos TypeScript para garantir qualidade do código:

```bash
pnpm build:check
```

**Nota**: Alguns erros de dependências externas são ignorados para não bloquear o build.

### 2. Compilação
A compilação é feita usando **tsup** para otimização:

```bash
pnpm build:compile
```

**Configurações**:
- **Target**: Node 18
- **Format**: CommonJS
- **Source Maps**: Habilitados
- **Entry**: `src/http/server.ts`

### 3. Build Completo
```bash
pnpm build
```

## 📁 Estrutura do Build

```
dist/
├── server.js          # Servidor compilado
└── server.js.map      # Source maps
```

## 🔍 Resolução de Problemas

### Erros de Compilação

#### 1. Erros de Tipo TypeScript
```bash
# Verificar tipos
pnpm build:check

# Se houver erros, verificar:
# - Imports corretos
# - Tipos definidos
# - Schemas Zod válidos
```

#### 2. Erros de Dependências
```bash
# Reinstalar dependências
pnpm install

# Limpar cache
pnpm store prune
```

#### 3. Erros de Banco de Dados
```bash
# Verificar conexão
pnpm db:migrate

# Reset do banco (cuidado!)
pnpm db:migrate:reset
```

### Erros Comuns

#### Erro: `Property 'openapi' does not exist`
**Solução**: Remover chamadas `.openapi()` dos schemas Zod.

#### Erro: `Cannot find name 'window'`
**Solução**: Este erro é de dependências externas e não afeta a API.

#### Erro: `Cannot find name 'jest'`
**Solução**: Arquivos de teste são excluídos do build de produção.

## 🚀 Deploy

### 1. Build de Produção
```bash
# Build otimizado
pnpm build

# Verificar arquivos gerados
ls dist/
```

### 2. Variáveis de Ambiente
Certifique-se de configurar:
```bash
# API
PORT=3333
API_PREFIX=/api
API_VERSION=v1

# Banco de dados
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET=your-secret-key

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=/docs
```

### 3. Iniciar Servidor
```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm start
```

## 📊 Monitoramento

### Logs
- **Desenvolvimento**: Logs coloridos com pino-pretty
- **Produção**: Logs estruturados em JSON

### Health Check
```bash
# Verificar se a API está rodando
curl http://localhost:3333/health

# Verificar documentação
curl http://localhost:3333/docs
```

## 🔧 Configurações Avançadas

### TypeScript
- **Config**: `tsconfig.json`
- **Target**: ES2022
- **Module**: Node16
- **Strict**: Habilitado

### Tsup (Build Tool)
- **Config**: `tsup.config.ts`
- **Entry**: `src/http/server.ts`
- **External**: `@prisma/client`
- **Source Maps**: Habilitados

### ESLint
- **Config**: Estende `@saas/eslint-config/node`
- **Auto-fix**: `pnpm lint`
- **Check only**: `pnpm lint:check`

## 📝 Checklist de Deploy

- [ ] Build executado com sucesso
- [ ] Testes passando
- [ ] Lint sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] Servidor iniciado
- [ ] Health check respondendo
- [ ] Documentação acessível

## 🆘 Suporte

Para problemas específicos:

1. **Verificar logs**: `pnpm dev` para logs detalhados
2. **Verificar tipos**: `pnpm build:check`
3. **Verificar lint**: `pnpm lint:check`
4. **Verificar testes**: `pnpm test`

---

**📞 Suporte**: Para dúvidas ou problemas, consulte a documentação da API ou entre em contato com a equipe de desenvolvimento.
