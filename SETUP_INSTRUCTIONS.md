# Instruções de Configuração - Sistema de Permissões

## Configuração Inicial

### 1. Preparar Ambiente

```bash
# Copiar arquivo de ambiente
cp env.example .env

# Instalar dependências
pnpm install

# Configurar banco de dados (se disponível)
docker compose up -d

# Aplicar schema com roles e planos
cd apps/api
pnpm prisma migrate reset --force

# Executar seed com usuários e planos
pnpm prisma db seed
```

### 2. Usuários de Teste Criados

| Email | Senha | Papel | Descrição |
|-------|-------|-------|-----------|
| `user@test.com` | `password123` | USER | Usuário básico com limites |
| `premium@test.com` | `password123` | PREMIUM | Usuário premium sem limites |
| `admin@test.com` | `password123` | ADMIN | Administrador com acesso total |
| `user@example.com` | `@Password123` | USER | Usuário original (compatibilidade) |

### 3. Executar Aplicação

```bash
# Terminal 1: API
cd apps/api
pnpm dev

# Terminal 2: Web
cd apps/web  
pnpm dev
```

### 4. Testar Funcionalidades

#### Como Usuário Básico (`user@test.com`)
1. Login na aplicação
2. Verificar badge "Usuário" na topbar
3. Tentar criar contas (máximo 5)
4. Verificar indicador de limites
5. Não ter acesso à página `/configuracoes/admin`

#### Como Usuário Premium (`premium@test.com`)
1. Login na aplicação
2. Verificar badge "Premium" na topbar
3. Criar recursos ilimitados
4. Acessar funcionalidades premium (quando implementadas)

#### Como Administrador (`admin@test.com`)
1. Login na aplicação
2. Verificar badge "Administrador" na topbar
3. Acessar `/configuracoes/admin`
4. Alterar papéis de outros usuários
5. Visualizar lista completa de usuários

### 5. Executar Testes

```bash
# Testes unitários
cd apps/web
pnpm test

# Testes E2E com Playwright
pnpm test:e2e

# Testes da API
cd apps/api
pnpm test
```

## Estrutura de Arquivos Criados/Modificados

### API (Backend)
```
apps/api/
├── prisma/
│   ├── schema.prisma (modificado - roles e planos)
│   └── seed-plans.ts (novo)
├── src/
│   ├── lib/
│   │   └── casl.ts (novo)
│   ├── middleware/
│   │   └── permissions.middleware.ts (novo)
│   ├── services/
│   │   ├── permission.service.ts (novo)
│   │   └── account.service.ts (modificado - limites)
│   ├── routes/
│   │   ├── permissions.ts (novo)
│   │   └── accounts.ts (modificado - middlewares)
│   ├── @types/
│   │   └── fastify.d.ts (modificado - ability)
│   └── server.ts (modificado - novas rotas)
```

### Web (Frontend)
```
apps/web/
├── app/
│   ├── layout.tsx (modificado - PermissionsProvider)
│   └── configuracoes/admin/page.tsx (novo)
├── components/
│   └── permissions/
│       ├── can-component.tsx (novo)
│       ├── permissions-guard.tsx (novo)
│       ├── plan-limits-indicator.tsx (novo)
│       ├── role-badge.tsx (novo)
│       └── user-role-display.tsx (novo)
├── lib/
│   ├── contexts/
│   │   └── permissions-context.tsx (novo)
│   ├── hooks/
│   │   └── use-permissions.ts (novo)
│   ├── services/
│   │   └── permissions.service.ts (novo)
│   └── api.ts (modificado - export)
├── __tests__/
│   ├── permissions/
│   │   ├── permissions-context.test.tsx (novo)
│   │   ├── can-component.test.tsx (novo)
│   │   ├── permissions-guards.test.tsx (novo)
│   │   └── plan-limits.test.tsx (novo)
│   └── integration/
│       └── permissions-flow.test.tsx (novo)
└── e2e/
    └── permissions.spec.ts (novo)
```

## Endpoints da API

### Permissões
- `GET /api/v1/permissions/my-abilities` - Habilidades do usuário atual
- `PUT /api/v1/permissions/users/:id/role` - Alterar papel (admin)
- `GET /api/v1/permissions/users` - Listar usuários (admin)
- `GET /api/v1/permissions/check-limits/:resource` - Verificar limites

### Recursos Protegidos
Todas as rotas existentes agora utilizam middleware de permissões:
- Contas: `authorize({ action: 'create|read|update|delete', subject: 'Account' })`
- Categorias: `authorize({ action: 'create|read|update|delete', subject: 'Category' })`
- Lançamentos: `authorize({ action: 'create|read|update|delete', subject: 'Entry' })`
- Cartões: `authorize({ action: 'create|read|update|delete', subject: 'CreditCard' })`

## Próximas Implementações

1. **Planos de Assinatura**: Interface de pagamento e upgrade
2. **Funcionalidades Premium**: Relatórios avançados, exportação
3. **Auditoria**: Log de alterações de permissões  
4. **Notificações**: Avisos de limites atingidos
5. **API Rate Limiting**: Diferentes limites por papel

## Troubleshooting

### Erro "DATABASE_URL not found"
Execute `docker compose up -d` para inicializar o banco ou configure `DATABASE_URL` no `.env`

### Erro de importação CASL
Verifique se as dependências foram instaladas: `@casl/ability`, `@casl/prisma`, `@casl/react`

### Testes E2E falhando
Certifique-se que a aplicação está rodando em `http://localhost:3000` antes de executar os testes

### Permissões não funcionando
Verifique se o `PermissionsProvider` está envolvendo a aplicação no `layout.tsx`