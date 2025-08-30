/**
 * Testes dos Guards de Permissão - Padrão MCP Context7
 */

import { ReactNode } from 'react'

import { render, screen } from '../setup/test-utils'
import { PermissionsGuard, RoleGuard, FullPermissionsGuard } from '@/components/permissions/permissions-guard'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { PermissionsProvider } from '@/lib/contexts/permissions-context'

// Context 1: Setup de Mocks
const mockUsers = {
  user: { id: 'user-1', email: 'user@test.com', name: 'User', role: 'USER' },
  premium: { id: 'premium-1', email: 'premium@test.com', name: 'Premium User', role: 'PREMIUM' },
  admin: { id: 'admin-1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN' },
}

jest.mock('@/lib/contexts/auth-context', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuthContext: jest.fn(),
}))

// Context 2: Helper para criar wrapper
const createWrapper = (user: typeof mockUsers.user) => {
  const { useAuthContext } = require('@/lib/contexts/auth-context')
  
  useAuthContext.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user,
  })
  
  return ({ children }: { children: ReactNode }) => (
    <AuthProvider>
      <PermissionsProvider>{children}</PermissionsProvider>
    </AuthProvider>
  )
}

describe('PermissionsGuard', () => {
  
  // Context 3: Testes básicos de permissão
  test('deve mostrar conteúdo quando usuário tem permissão', () => {
    const wrapper = createWrapper(mockUsers.user)
    
    // Context 4-7: Testar acesso permitido
    render(
      <PermissionsGuard action="create" subject="Account">
        <div data-testid="protected-content">Conteúdo Protegido</div>
      </PermissionsGuard>,
      { wrapper }
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  test('deve mostrar mensagem padrão quando sem permissão', () => {
    const wrapper = createWrapper(mockUsers.user)
    
    // Context 4-7: Testar acesso negado
    render(
      <PermissionsGuard action="manage" subject="all">
        <div data-testid="admin-content">Conteúdo Admin</div>
      </PermissionsGuard>,
      { wrapper }
    )
    
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByText('Permissão Necessária')).toBeInTheDocument()
    expect(screen.getByText(/Você precisa de permissão/)).toBeInTheDocument()
  })

  test('deve mostrar fallback customizado quando fornecido', () => {
    const wrapper = createWrapper(mockUsers.user)
    
    // Context 4-7: Testar fallback customizado
    render(
      <PermissionsGuard 
        action="manage" 
        subject="all"
        fallback={<div data-testid="custom-fallback">Fallback Customizado</div>}
      >
        <div data-testid="admin-content">Conteúdo Admin</div>
      </PermissionsGuard>,
      { wrapper }
    )
    
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
  })

  test('deve ocultar completamente quando showFallback=false', () => {
    const wrapper = createWrapper(mockUsers.user)
    
    render(
      <PermissionsGuard action="manage" subject="all" showFallback={false}>
        <div data-testid="admin-content">Conteúdo Admin</div>
      </PermissionsGuard>,
      { wrapper }
    )
    
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.queryByText('Permissão Necessária')).not.toBeInTheDocument()
  })
})

describe('RoleGuard', () => {
  
  // Context 3: Testes de papel único
  test('deve permitir acesso para papel correto', () => {
    const wrapper = createWrapper(mockUsers.admin)
    
    // Context 4-7: Testar acesso por papel
    render(
      <RoleGuard roles="ADMIN">
        <div data-testid="admin-only-content">Só Admin</div>
      </RoleGuard>,
      { wrapper }
    )
    
    expect(screen.getByTestId('admin-only-content')).toBeInTheDocument()
  })

  test('deve negar acesso para papel incorreto', () => {
    const wrapper = createWrapper(mockUsers.user)
    
    render(
      <RoleGuard roles="ADMIN">
        <div data-testid="admin-only-content">Só Admin</div>
      </RoleGuard>,
      { wrapper }
    )
    
    expect(screen.queryByTestId('admin-only-content')).not.toBeInTheDocument()
    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument()
  })

  // Context 3: Testes de múltiplos papéis
  test('deve permitir acesso para qualquer papel da lista', () => {
    const wrapper = createWrapper(mockUsers.premium)
    
    // Context 4-7: Testar múltiplos papéis permitidos
    render(
      <RoleGuard roles={['PREMIUM', 'ADMIN']}>
        <div data-testid="premium-admin-content">Premium ou Admin</div>
      </RoleGuard>,
      { wrapper }
    )
    
    expect(screen.getByTestId('premium-admin-content')).toBeInTheDocument()
  })

  test('deve negar acesso quando papel não está na lista', () => {
    const wrapper = createWrapper(mockUsers.user)
    
    render(
      <RoleGuard roles={['PREMIUM', 'ADMIN']}>
        <div data-testid="premium-admin-content">Premium ou Admin</div>
      </RoleGuard>,
      { wrapper }
    )
    
    expect(screen.queryByTestId('premium-admin-content')).not.toBeInTheDocument()
    expect(screen.getByText(/Apenas usuários com papel/)).toBeInTheDocument()
  })
})

describe('FullPermissionsGuard', () => {
  
  // Context 3: Testes combinados de papel e permissão
  test('deve requerer tanto papel quanto permissão específica', () => {
    const wrapper = createWrapper(mockUsers.admin)
    
    // Context 4-7: Testar guard completo
    render(
      <FullPermissionsGuard roles="ADMIN" action="manage" subject="all">
        <div data-testid="full-access-content">Acesso Total</div>
      </FullPermissionsGuard>,
      { wrapper }
    )
    
    expect(screen.getByTestId('full-access-content')).toBeInTheDocument()
  })

  test('deve negar acesso se papel incorreto mesmo com permissões', () => {
    const wrapper = createWrapper(mockUsers.user)
    
    render(
      <FullPermissionsGuard roles="ADMIN" action="create" subject="Account">
        <div data-testid="restricted-content">Conteúdo Restrito</div>
      </FullPermissionsGuard>,
      { wrapper }
    )
    
    expect(screen.queryByTestId('restricted-content')).not.toBeInTheDocument()
  })
})

// Context 3: Testes de usuário não autenticado
describe('Usuário não autenticado', () => {
  
  test('guards devem negar acesso para usuário não autenticado', () => {
    useAuthContext.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>
        <PermissionsProvider>{children}</PermissionsProvider>
      </AuthProvider>
    )
    
    // Context 4-7: Verificar múltiplos guards
    render(
      <>
        <Can action="create" subject="Account">
          <div data-testid="can-content">Can Content</div>
        </Can>
        <RoleGuard roles="USER">
          <div data-testid="role-content">Role Content</div>
        </RoleGuard>
        <PermissionsGuard action="read" subject="Account">
          <div data-testid="permission-content">Permission Content</div>
        </PermissionsGuard>
      </>,
      { wrapper }
    )
    
    expect(screen.queryByTestId('can-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('role-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('permission-content')).not.toBeInTheDocument()
  })
})