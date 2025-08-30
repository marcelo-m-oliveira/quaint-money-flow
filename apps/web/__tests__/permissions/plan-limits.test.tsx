/**
 * Testes de Limites de Plano - Padrão MCP Context7
 */

import { ReactNode } from 'react'

import { render, screen } from '../setup/test-utils'
import { PlanLimitsIndicator, PlanLimitsBadge } from '@/components/permissions/plan-limits-indicator'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { PermissionsProvider } from '@/lib/contexts/permissions-context'

// Context 1: Mocks de dados de limite
const mockLimitsData = {
  withinLimit: {
    allowed: true,
    limit: 10,
    current: 3,
    remaining: 7,
  },
  nearLimit: {
    allowed: true,
    limit: 10,
    current: 9,
    remaining: 1,
  },
  atLimit: {
    allowed: false,
    limit: 10,
    current: 10,
    remaining: 0,
  },
  unlimited: {
    allowed: true,
    limit: -1,
    current: 50,
    remaining: undefined,
  },
}

// Context 2: Mock do hook usePlanLimits
jest.mock('@/lib/hooks/use-permissions', () => ({
  usePlanLimits: jest.fn(),
  useUserRole: () => ({ isAdmin: false }),
  useCanPerform: () => ({ can: () => true }),
}))

const { usePlanLimits } = require('@/lib/hooks/use-permissions')

// Context 2: Wrapper para testes
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <PermissionsProvider>{children}</PermissionsProvider>
  </AuthProvider>
)

describe('PlanLimitsIndicator', () => {
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Context 3: Testes com limite normal
  test('deve exibir progresso dentro do limite', () => {
    usePlanLimits.mockReturnValue({
      ...mockLimitsData.withinLimit,
      isLoading: false,
      error: null,
    })
    
    // Context 4-7: Renderizar e verificar exibição
    render(
      <PlanLimitsIndicator resource="accounts" showDetails={true} />,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByText('Contas')).toBeInTheDocument()
    expect(screen.getByText('3 de 10 utilizados')).toBeInTheDocument()
    expect(screen.getByText('30%')).toBeInTheDocument()
  })

  // Context 3: Testes próximo ao limite
  test('deve exibir aviso quando próximo do limite', () => {
    usePlanLimits.mockReturnValue({
      ...mockLimitsData.nearLimit,
      isLoading: false,
      error: null,
    })
    
    // Context 4-7: Verificar aviso
    render(
      <PlanLimitsIndicator resource="accounts" showDetails={true} />,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByText('9 de 10 utilizados')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText(/Próximo do limite/)).toBeInTheDocument()
    expect(screen.getByText(/Restam 1 itens/)).toBeInTheDocument()
  })

  // Context 3: Testes no limite
  test('deve exibir erro quando limite atingido', () => {
    usePlanLimits.mockReturnValue({
      ...mockLimitsData.atLimit,
      isLoading: false,
      error: null,
    })
    
    // Context 4-7: Verificar erro de limite
    render(
      <PlanLimitsIndicator resource="accounts" showDetails={true} />,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByText('10 de 10 utilizados')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText(/Limite atingido/)).toBeInTheDocument()
    expect(screen.getByText(/Considere fazer upgrade/)).toBeInTheDocument()
  })

  // Context 3: Testes com plano ilimitado
  test('deve exibir status ilimitado para planos premium', () => {
    usePlanLimits.mockReturnValue({
      ...mockLimitsData.unlimited,
      isLoading: false,
      error: null,
    })
    
    // Context 4-7: Verificar exibição de ilimitado
    render(
      <PlanLimitsIndicator resource="accounts" showDetails={true} />,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByText('50 de ∞ utilizados')).toBeInTheDocument()
    expect(screen.getByText('Ilimitado')).toBeInTheDocument()
    expect(screen.getByText(/Ilimitado no seu plano/)).toBeInTheDocument()
  })

  // Context 3: Testes de loading
  test('deve exibir loading state', () => {
    usePlanLimits.mockReturnValue({
      isLoading: true,
      error: null,
    })
    
    // Context 4-7: Verificar estado de carregamento
    render(
      <PlanLimitsIndicator resource="accounts" />,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  test('deve ocultar quando há erro', () => {
    usePlanLimits.mockReturnValue({
      isLoading: false,
      error: new Error('API Error'),
      limit: null,
    })
    
    render(
      <PlanLimitsIndicator resource="accounts" />,
      { wrapper: TestWrapper }
    )
    
    // Não deve renderizar nada em caso de erro
    expect(screen.queryByText('Contas')).not.toBeInTheDocument()
  })
})

describe('PlanLimitsBadge', () => {
  
  // Context 3: Badge para diferentes recursos
  test('deve exibir badge para cada tipo de recurso', () => {
    const resources = ['accounts', 'categories', 'creditCards'] as const
    
    resources.forEach((resource) => {
      usePlanLimits.mockReturnValue({
        ...mockLimitsData.nearLimit,
        isLoading: false,
        error: null,
      })
      
      // Context 4-7: Testar badge para cada recurso
      const { unmount } = render(
        <PlanLimitsBadge resource={resource} />,
        { wrapper: TestWrapper }
      )
      
      expect(screen.getByText('9/10')).toBeInTheDocument()
      unmount()
    })
  })

  test('deve exibir "Limite atingido" quando no limite', () => {
    usePlanLimits.mockReturnValue({
      ...mockLimitsData.atLimit,
      isLoading: false,
      error: null,
    })
    
    // Context 4-7: Verificar badge de limite atingido
    render(
      <PlanLimitsBadge resource="accounts" />,
      { wrapper: TestWrapper }
    )
    
    expect(screen.getByText('10/10 (Limite atingido)')).toBeInTheDocument()
  })

  test('não deve renderizar quando dentro do limite normal', () => {
    usePlanLimits.mockReturnValue({
      ...mockLimitsData.withinLimit,
      isLoading: false,
      error: null,
    })
    
    render(
      <PlanLimitsBadge resource="accounts" />,
      { wrapper: TestWrapper }
    )
    
    // Badge só aparece quando próximo ou no limite
    expect(screen.queryByText(/3\/10/)).not.toBeInTheDocument()
  })
})