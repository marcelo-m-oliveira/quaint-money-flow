/**
 * Testes do Contexto de Permissões - Padrão MCP Context7
 * 
 * Testa os hooks e contextos relacionados a permissões
 */

import { render, renderHook } from '@testing-library/react'
import { ReactNode } from 'react'

import { AuthProvider } from '@/lib/contexts/auth-context'
import { PermissionsProvider, usePermissions, usePermission, useRole } from '@/lib/contexts/permissions-context'

// Context 1: Setup de Mock para AuthContext
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
}

const mockAuthContext = {
  isAuthenticated: true,
  isLoading: false,
  user: mockUser,
}

// Mock do useAuthContext
jest.mock('@/lib/contexts/auth-context', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuthContext: () => mockAuthContext,
}))

// Context 2: Helper para criar wrapper com providers
const createWrapper = (userRole = 'USER') => {
  const modifiedUser = { ...mockUser, role: userRole }
  const modifiedAuthContext = { ...mockAuthContext, user: modifiedUser }
  
  // Update mock for this test
  ;(require('@/lib/contexts/auth-context').useAuthContext as jest.Mock).mockReturnValue(modifiedAuthContext)
  
  return ({ children }: { children: ReactNode }) => (
    <AuthProvider>
      <PermissionsProvider>{children}</PermissionsProvider>
    </AuthProvider>
  )
}

describe('PermissionsContext', () => {
  
  // Context 3: Testes do hook usePermissions
  describe('usePermissions', () => {
    test('deve retornar contexto de permissões válido', () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(() => usePermissions(), { wrapper })
      
      expect(result.current).toHaveProperty('ability')
      expect(result.current).toHaveProperty('can')
    })

    test('deve lançar erro quando usado fora do provider', () => {
      // Capturar erro do console
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => usePermissions())
      }).toThrow('usePermissions must be used within a PermissionsProvider')
      
      consoleSpy.mockRestore()
    })
  })

  // Context 4: Testes do hook usePermission
  describe('usePermission', () => {
    test('usuário básico deve ter permissões limitadas', () => {
      const wrapper = createWrapper('USER')
      
      const { result } = renderHook(() => usePermission(), { wrapper })
      
      // Context 5-7: Verificar permissões específicas
      expect(result.current.can('create', 'Account')).toBe(true)
      expect(result.current.can('manage', 'all')).toBe(false)
      expect(result.current.cannot('delete', 'User')).toBe(true)
    })

    test('usuário premium deve ter permissões expandidas', () => {
      const wrapper = createWrapper('PREMIUM')
      
      const { result } = renderHook(() => usePermission(), { wrapper })
      
      expect(result.current.can('create', 'Account')).toBe(true)
      expect(result.current.can('read', 'AdvancedReports')).toBe(true)
      expect(result.current.can('manage', 'all')).toBe(false)
    })

    test('administrador deve ter permissões totais', () => {
      const wrapper = createWrapper('ADMIN')
      
      const { result } = renderHook(() => usePermission(), { wrapper })
      
      expect(result.current.can('manage', 'all')).toBe(true)
      expect(result.current.can('create', 'Account')).toBe(true)
      expect(result.current.can('delete', 'User')).toBe(true)
    })
  })

  // Context 4: Testes do hook useRole
  describe('useRole', () => {
    test('deve identificar papel do usuário corretamente', () => {
      const wrapper = createWrapper('PREMIUM')
      
      const { result } = renderHook(() => useRole(), { wrapper })
      
      // Context 5-7: Verificar métodos de identificação de papel
      expect(result.current.hasRole('PREMIUM')).toBe(true)
      expect(result.current.hasRole(['USER', 'PREMIUM'])).toBe(true)
      expect(result.current.hasRole('ADMIN')).toBe(false)
      expect(result.current.isPremium()).toBe(true)
      expect(result.current.isAdmin()).toBe(false)
      expect(result.current.isUser()).toBe(false)
      expect(result.current.getCurrentRole()).toBe('PREMIUM')
    })
  })

  // Context 3: Testes de usuário não autenticado
  describe('Usuário não autenticado', () => {
    test('deve ter permissões mínimas', () => {
      // Update mock para usuário não autenticado
      ;(require('@/lib/contexts/auth-context').useAuthContext as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })

      const wrapper = createWrapper()
      
      const { result } = renderHook(() => usePermission(), { wrapper })
      
      // Context 4-7: Verificar ausência de permissões
      expect(result.current.can('create', 'Account')).toBe(false)
      expect(result.current.can('read', 'Account')).toBe(false)
      expect(result.current.can('manage', 'all')).toBe(false)
    })
  })
})