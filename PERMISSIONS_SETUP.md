# Sistema de Permissões com CASL

Este documento descreve a implementação do sistema de permissões utilizando CASL seguindo o padrão MCP Context7.

## Estrutura Implementada

### 1. Modelos de Dados (Prisma Schema)

- **UserRole enum**: USER, PREMIUM, ADMIN
- **Plan model**: Estrutura para planos futuros com features e limites
- **User model**: Atualizado com `role` e `planId`

### 2. API (Backend)

#### CASL Configuration (`/src/lib/casl.ts`)
- Definições de habilidades baseadas em roles
- Tipos para Actions e Subjects
- Função `defineAbilitiesFor()` para criar habilidades por usuário

#### Middleware de Permissões (`/src/middleware/permissions.middleware.ts`)
- `authorize()`: Middleware para verificar permissões específicas
- `requireRole()`: Middleware para verificar papéis
- Integração com CASL para verificação de habilidades

#### Serviço de Permissões (`/src/services/permission.service.ts`)
- Métodos para verificar permissões
- Verificação de limites de plano
- Gestão de roles e habilidades

#### Rotas de Permissões (`/src/routes/permissions.ts`)
- `GET /permissions/my-abilities`: Buscar habilidades do usuário
- `PUT /permissions/users/:id/role`: Alterar papel (admin only)
- `GET /permissions/users`: Listar usuários (admin only)  
- `GET /permissions/check-limits/:resource`: Verificar limites

### 3. Aplicação Web (Frontend)

#### Context de Permissões (`/lib/contexts/permissions-context.tsx`)
- Provider de permissões integrado com CASL
- Hooks: `usePermissions()`, `usePermission()`, `useRole()`
- Definições de habilidades no frontend

#### Componentes de Permissão
- **Can/Cannot**: Renderização condicional baseada em permissões
- **PermissionsGuard**: Guard para proteger conteúdo
- **RoleGuard**: Guard baseado em papéis
- **PlanLimitsIndicator**: Indicador visual de limites
- **UserRoleDisplay**: Exibição do papel do usuário

#### Hooks (`/lib/hooks/use-permissions.ts`)
- `useUserAbilities()`: Buscar habilidades da API
- `usePlanLimits()`: Verificar limites de recursos
- `useCanPerform()`: Verificações de permissão
- `useUserRole()`: Informações de papel do usuário

#### Serviços (`/lib/services/permissions.service.ts`)
- `PermissionsService`: Comunicação com API de permissões
- Métodos para gestão de usuários e verificação de limites

### 4. Páginas e Integrações

#### Página de Administração (`/configuracoes/admin/page.tsx`)
- Interface para gerenciar usuários
- Alteração de papéis (admin only)
- Lista de usuários com filtros

#### Integração em Componentes
- **Topbar**: Exibição de papel e acesso a admin
- **Layout**: Provider de permissões integrado
- **AccountFormModal**: Verificação de limites antes da criação

### 5. Testes (Playwright + Jest)

#### Testes E2E (`/e2e/permissions.spec.ts`)
- Padrão MCP Context7 implementado
- 7 contextos por cenário de teste
- Cobertura completa de fluxos de usuário

#### Testes de Componentes
- **permissions-context.test.tsx**: Testes dos hooks de contexto
- **can-component.test.tsx**: Testes dos componentes Can/Cannot
- **permissions-guards.test.tsx**: Testes dos guards
- **plan-limits.test.tsx**: Testes de indicadores de limite
- **permissions-flow.test.tsx**: Teste de integração completa

### 6. Dados de Seed

#### Usuários de Teste
- `user@test.com`: Usuário básico (USER)
- `premium@test.com`: Usuário premium (PREMIUM)  
- `admin@test.com`: Administrador (ADMIN)
- `user@example.com`: Usuário original (compatibilidade)

#### Planos (`/prisma/seed-plans.ts`)
- **Básico**: 5 contas, 20 categorias, 3 cartões, 100 transações/mês
- **Premium**: Recursos ilimitados, funcionalidades avançadas

## Uso

### Verificar Permissões na API
```typescript
// Em rotas
preHandler: [
  authMiddleware,
  authorize({ action: 'create', subject: 'Account' }),
  // ... outros middlewares
]

// Em serviços
const limits = await PermissionService.checkPlanLimits(userId, 'accounts')
if (!limits.allowed) {
  throw new BadRequestError('Limite atingido')
}
```

### Verificar Permissões no Frontend
```tsx
// Componente Can
<Can action="create" subject="Account">
  <CreateAccountButton />
</Can>

// Hook usePermission
const { can } = usePermission()
if (can('create', 'Account')) {
  // Permitir ação
}

// Hook useRole
const { isAdmin, isPremium } = useUserRole()

// Guard de permissões
<PermissionsGuard action="manage" subject="all">
  <AdminPanel />
</PermissionsGuard>

// Indicador de limites
<PlanLimitsIndicator resource="accounts" />
```

### Executar Migrações

```bash
# Aplicar schema com roles e planos
cd apps/api
pnpm prisma migrate reset

# Executar seed com usuários e planos
pnpm prisma db seed
```

### Executar Testes

```bash
# Testes unitários
cd apps/web  
pnpm test

# Testes E2E
pnpm test:e2e

# Todos os testes
pnpm test:all
```

## Próximos Passos

1. **Implementar planos de assinatura**: Interface de pagamento e upgrade
2. **Funcionalidades premium**: Relatórios avançados, exportação, etc.
3. **Auditoria**: Log de alterações de permissões
4. **Notificações**: Avisos de limite de plano
5. **API rate limiting**: Diferentes limites por papel

## Estrutura de Permissões

### Roles e Capacidades

| Role    | Contas | Categorias | Cartões | Transações | Admin | Recursos Premium |
|---------|--------|------------|---------|------------|-------|------------------|
| USER    | 5      | 20         | 3       | 100/mês    | ❌    | ❌               |
| PREMIUM | ∞      | ∞          | ∞       | ∞          | ❌    | ✅               |
| ADMIN   | ∞      | ∞          | ∞       | ∞          | ✅    | ✅               |

### Actions Disponíveis
- `create`: Criar recursos
- `read`: Visualizar recursos  
- `update`: Atualizar recursos
- `delete`: Excluir recursos
- `manage`: Controle total (create + read + update + delete)

### Subjects Controlados
- `Account`: Contas bancárias
- `Category`: Categorias de transações
- `Entry`: Lançamentos/Transações
- `CreditCard`: Cartões de crédito
- `UserPreferences`: Preferências do usuário
- `User`: Dados do usuário
- `Plan`: Informações de planos
- `all`: Todos os recursos (apenas admin)

O sistema está pronto para uso e expansão futura com novos recursos e funcionalidades premium.