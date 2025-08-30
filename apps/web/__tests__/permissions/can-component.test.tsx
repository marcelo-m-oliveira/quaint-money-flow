/**
 * Testes do Componente Can - Padrão MCP Context7
 */

import { ReactNode } from 'react'

import { render, screen } from '../setup/test-utils'
import { Can, Cannot } from '@/components/permissions/can-component'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { PermissionsProvider } from '@/lib/contexts/permissions-context'

// Context 1: Setup de Mocks
const mockUsers = {
  user: { id: 'user-1', email: 'user@test.com', name: 'User', role: 'USER' },
  premium: { id: 'premium-1', email: 'premium@test.com', name: 'Premium User', role: 'PREMIUM' },
  admin: { id: 'admin-1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN' },
}

// Mock do useAuthContext
jest.mock('@/lib/contexts/auth-context', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuthContext: jest.fn(),
}))

const { useAuthContext } = require('@/lib/contexts/auth-context')

// Context 2: Helper para criar wrapper com usuário específico
const createWrapper = (user: typeof mockUsers.user) => {
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

describe('Componente Can', () => {
  
  // Context 3: Testes com usuário básico
  describe('Usuário básico (USER)', () => {
    
    test('deve mostrar conteúdo para ações permitidas', () => {
      const wrapper = createWrapper(mockUsers.user)
      
      // Context 4-5: Renderizar componente com ação permitida
      render(
        <Can action="create" subject="Account">
          <div data-testid="allowed-content">Criar Conta</div>
        </Can>,
        { wrapper }
      )
      
      // Context 6-7: Verificar conteúdo visível
      expect(screen.getByTestId('allowed-content')).toBeInTheDocument()
      expect(screen.getByText('Criar Conta')).toBeInTheDocument()
    })

    test('deve ocultar conteúdo para ações não permitidas', () => {
      const wrapper = createWrapper(mockUsers.user)
      
      // Context 4-5: Renderizar componente com ação não permitida  
      render(
        <Can action="delete" subject="User">
          <div data-testid="forbidden-content">Excluir Usuário</div>
        </Can>,
        { wrapper }
      )
      
      // Context 6-7: Verificar conteúdo oculto
      expect(screen.queryByTestId('forbidden-content')).not.toBeInTheDocument()
    })

    test('deve mostrar fallback quando fornecido', () => {
      const wrapper = createWrapper(mockUsers.user)
      
      // Context 4-5: Renderizar com fallback
      render(
        <Can 
          action="manage" 
          subject="all" 
          fallback={<div data-testid="fallback-content">Sem permissão</div>}
        >
          <div data-testid="admin-content">Painel Admin</div>
        </Can>,
        { wrapper }
      )
      
      // Context 6-7: Verificar fallback visível
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('fallback-content')).toBeInTheDocument()
      expect(screen.getByText('Sem permissão')).toBeInTheDocument()
    })
  })

  // Context 3: Testes com usuário premium
  describe('Usuário premium (PREMIUM)', () => {
    
    test('deve ter acesso a recursos básicos e premium', () => {
      const wrapper = createWrapper(mockUsers.premium)
      
      // Context 4-7: Verificar acesso a recursos premium
      render(
        <>
          <Can action="create" subject="Account">
            <div data-testid="basic-feature">Recurso Básico</div>
          </Can>
          <Can action="read" subject="AdvancedReports">
            <div data-testid="premium-feature">Relatórios Avançados</div>
          </Can>
        </>,
        { wrapper }
      )
      
      expect(screen.getByTestId('basic-feature')).toBeInTheDocument()
      expect(screen.getByTestId('premium-feature')).toBeInTheDocument()
    })
  })

  // Context 3: Testes com administrador
  describe('Administrador (ADMIN)', () => {
    
    test('deve ter acesso total', () => {
      const wrapper = createWrapper(mockUsers.admin)
      
      // Context 4-7: Verificar acesso administrativo
      render(
        <Can action="manage" subject="all">
          <div data-testid="admin-access">Acesso Total</div>
        </Can>,
        { wrapper }
      )
      
      expect(screen.getByTestId('admin-access')).toBeInTheDocument()
    })
  })

  // Context 3: Testes com usuário não autenticado
  describe('Usuário não autenticado', () => {
    
    test('deve negar acesso a todos os recursos', () => {
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
      
      // Context 4-7: Verificar negação de acesso
      render(
        <Can action="create" subject="Account">
          <div data-testid="protected-content">Conteúdo Protegido</div>
        </Can>,
        { wrapper }
      )
      
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })
})

describe('Componente Cannot', () => {
  
  // Context 3-4: Teste básico do Cannot
  test('deve mostrar conteúdo quando usuário NÃO tem permissão', () => {
    const wrapper = createWrapper(mockUsers.user)
    
    // Context 5-7: Verificar renderização inversa
    render(
      <Cannot action="manage" subject="all">
        <div data-testid="restricted-message">Acesso Restrito</div>
      </Cannot>,
      { wrapper }
    )
    
    expect(screen.getByTestId('restricted-message')).toBeInTheDocument()
  })

  test('deve ocultar conteúdo quando usuário TEM permissão', () => {
    const wrapper = createWrapper(mockUsers.admin)
    
    render(
      <Cannot action="manage" subject="all">
        <div data-testid="restricted-message">Acesso Restrito</div>
      </Cannot>,
      { wrapper }
    )
    
    expect(screen.queryByTestId('restricted-message')).not.toBeInTheDocument()
  })
})