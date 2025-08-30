/**
 * Teste de Integração - Fluxo de Permissões
 * Padrão MCP Context7
 * 
 * Testa o fluxo completo de permissões desde autenticação até uso de recursos
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { AuthProvider } from '@/lib/contexts/auth-context'
import { PermissionsProvider } from '@/lib/contexts/permissions-context'
import { AccountsProvider } from '@/lib/contexts/accounts-context'
import { UserRoleDisplay } from '@/components/permissions/user-role-display'
import { Can } from '@/components/permissions/can-component'
import { PlanLimitsIndicator } from '@/components/permissions/plan-limits-indicator'

// Context 1: Setup de mocks para integração
jest.mock('@/lib/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/hooks/use-permissions', () => ({
  useUserRole: jest.fn(),
  usePermission: jest.fn(),
  usePlanLimits: jest.fn(),
}))

jest.mock('@/lib/contexts/auth-context', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuthContext: jest.fn(),
}))

const mockHooks = {
  useAuth: require('@/lib/hooks/use-auth').useAuth,
  useUserRole: require('@/lib/hooks/use-permissions').useUserRole,
  usePermission: require('@/lib/hooks/use-permissions').usePermission,
  usePlanLimits: require('@/lib/hooks/use-permissions').usePlanLimits,
  useAuthContext: require('@/lib/contexts/auth-context').useAuthContext,
}

// Context 2: Cenários de usuário
const userScenarios = {
  basicUser: {
    user: { id: 'user-1', name: 'João', email: 'joao@test.com', role: 'USER' },
    auth: { isAuthenticated: true, isLoading: false },
    role: { role: 'USER', isAdmin: false, isPremium: false, isUser: true, getCurrentRole: () => 'USER', hasRole: (r: string | string[]) => Array.isArray(r) ? r.includes('USER') : r === 'USER' },
    permissions: { can: (action: string, subject: string) => ['create:Account', 'read:Account', 'update:Account'].includes(`${action}:${subject}`), cannot: (action: string, subject: string) => !['create:Account', 'read:Account', 'update:Account'].includes(`${action}:${subject}`) },
    limits: { allowed: true, limit: 5, current: 2, remaining: 3, isLoading: false, error: null }
  },
  
  premiumUser: {
    user: { id: 'premium-1', name: 'Maria Premium', email: 'maria@test.com', role: 'PREMIUM' },
    auth: { isAuthenticated: true, isLoading: false },
    role: { role: 'PREMIUM', isAdmin: false, isPremium: true, isUser: false, getCurrentRole: () => 'PREMIUM', hasRole: (r: string | string[]) => Array.isArray(r) ? r.includes('PREMIUM') : r === 'PREMIUM' },
    permissions: { can: () => true, cannot: () => false },
    limits: { allowed: true, limit: -1, current: 10, remaining: undefined, isLoading: false, error: null }
  },

  adminUser: {
    user: { id: 'admin-1', name: 'Carlos Admin', email: 'carlos@test.com', role: 'ADMIN' },
    auth: { isAuthenticated: true, isLoading: false },
    role: { role: 'ADMIN', isAdmin: true, isPremium: false, isUser: false, getCurrentRole: () => 'ADMIN', hasRole: () => true },
    permissions: { can: () => true, cannot: () => false },
    limits: { allowed: true, limit: -1, current: 50, remaining: undefined, isLoading: false, error: null }
  }
}

// Context 3: Helper para configurar cenário de teste
const setupUserScenario = (scenario: keyof typeof userScenarios) => {
  const config = userScenarios[scenario]
  
  mockHooks.useAuthContext.mockReturnValue({
    ...config.auth,
    user: config.user
  })
  
  mockHooks.useAuth.mockReturnValue({
    ...config.auth,
    user: config.user,
    logout: jest.fn()
  })
  
  mockHooks.useUserRole.mockReturnValue(config.role)
  mockHooks.usePermission.mockReturnValue(config.permissions)
  mockHooks.usePlanLimits.mockReturnValue(config.limits)
}

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <PermissionsProvider>
      <AccountsProvider>
        {children}
      </AccountsProvider>
    </PermissionsProvider>
  </AuthProvider>
)

describe('Fluxo de Integração de Permissões', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Context 4: Teste de fluxo completo para usuário básico
  test('usuário básico deve ter experiência limitada mas funcional', async () => {
    setupUserScenario('basicUser')
    
    // Context 5: Renderizar interface do usuário
    render(
      <div>
        <UserRoleDisplay />
        <Can action="create" subject="Account">
          <button data-testid="create-account">Criar Conta</button>
        </Can>
        <Can action="manage" subject="all">
          <button data-testid="admin-panel">Painel Admin</button>
        </Can>
        <PlanLimitsIndicator resource="accounts" />
      </div>,
      { wrapper: TestWrapper }
    )
    
    // Context 6: Verificar elementos visíveis para usuário básico
    expect(screen.getByText('Usuário')).toBeInTheDocument()
    expect(screen.getByTestId('create-account')).toBeInTheDocument()
    expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument()
    expect(screen.getByText('2 de 5 utilizados')).toBeInTheDocument()
    
    // Context 7: Simular interação
    fireEvent.click(screen.getByTestId('create-account'))
    // Verificar que ação é permitida (não gera erro)
  })

  // Context 4: Teste de fluxo para usuário premium
  test('usuário premium deve ter acesso a recursos avançados', async () => {
    setupUserScenario('premiumUser')
    
    // Context 5-7: Verificar experiência premium
    render(
      <div>
        <UserRoleDisplay />
        <Can action="create" subject="Account">
          <button data-testid="create-account">Criar Conta</button>
        </Can>
        <Can action="read" subject="AdvancedReports">
          <button data-testid="advanced-reports">Relatórios Avançados</button>
        </Can>
        <PlanLimitsIndicator resource="accounts" />
      </div>,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.getByTestId('create-account')).toBeInTheDocument()
    expect(screen.getByTestId('advanced-reports')).toBeInTheDocument()
    expect(screen.getByText('Ilimitado')).toBeInTheDocument()
  })

  // Context 4: Teste de fluxo para administrador
  test('administrador deve ter controle total', async () => {
    setupUserScenario('adminUser')
    
    // Context 5-7: Verificar acesso administrativo
    render(
      <div>
        <UserRoleDisplay />
        <Can action="manage" subject="all">
          <button data-testid="admin-panel">Painel Admin</button>
        </Can>
        <Can action="delete" subject="User">
          <button data-testid="delete-user">Excluir Usuário</button>
        </Can>
      </div>,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getByTestId('admin-panel')).toBeInTheDocument()
    expect(screen.getByTestId('delete-user')).toBeInTheDocument()
  })

  // Context 4: Teste de transições entre estados
  test('deve reagir corretamente a mudanças de papel do usuário', async () => {
    // Context 5: Iniciar como usuário básico
    setupUserScenario('basicUser')
    
    const { rerender } = render(
      <UserRoleDisplay />,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByText('Usuário')).toBeInTheDocument()
    
    // Context 6: Mudar para premium
    setupUserScenario('premiumUser')
    rerender(<UserRoleDisplay />)
    
    // Context 7: Verificar atualização
    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })
  })

  // Context 4: Teste de estados de erro e loading
  test('deve lidar graciosamente com estados de loading e erro', async () => {
    // Context 5: Setup com loading
    mockHooks.useAuthContext.mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
      user: null
    })
    
    mockHooks.usePlanLimits.mockReturnValue({
      isLoading: true,
      error: null
    })
    
    // Context 6-7: Verificar estado de loading
    render(
      <PlanLimitsIndicator resource="accounts" />,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })
})