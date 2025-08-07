import { beforeEach, describe, it } from '@jest/globals'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { FinancialDashboard } from '@/components/financial-dashboard'

import {
  clearAllMocks,
  expectToBeInTheDocument,
  render,
} from './setup/test-utils'

describe('FinancialDashboard', () => {
  beforeEach(() => {
    clearAllMocks()
  })

  it('deve renderizar o dashboard corretamente', () => {
    render(<FinancialDashboard />)

    expectToBeInTheDocument(screen.getByText('Marcelo Oliveira!'))
    expectToBeInTheDocument(screen.getByText('Receitas no mês atual'))
    expectToBeInTheDocument(screen.getByText('Despesas no mês atual'))
    expectToBeInTheDocument(screen.getByText('Acesso rápido'))
  })

  it('deve exibir botões de ação', () => {
    render(<FinancialDashboard />)

    expectToBeInTheDocument(screen.getByText('NOVA DESPESA'))
    expectToBeInTheDocument(screen.getByText('NOVA RECEITA'))
  })

  it('deve abrir modal ao clicar em Nova Despesa', async () => {
    render(<FinancialDashboard />)

    const newExpenseButton = screen.getByText('NOVA DESPESA')
    fireEvent.click(newExpenseButton)

    await waitFor(() => {
      expectToBeInTheDocument(screen.getByText('Nova despesa'))
    })
  })

  it('deve abrir modal ao clicar em Nova Receita', async () => {
    render(<FinancialDashboard />)

    const newIncomeButton = screen.getByText('NOVA RECEITA')
    fireEvent.click(newIncomeButton)

    await waitFor(() => {
      expectToBeInTheDocument(screen.getByText('Nova receita'))
    })
  })
})

// Testes dos hooks personalizados
// Nota: Para implementar testes de hooks, seria necessário instalar @testing-library/react-hooks
// ou usar renderHook do @testing-library/react (versão 13+)

// Exemplo de como seria a estrutura dos testes de hooks:
/*
import { renderHook } from '@testing-library/react'
import { useFinancialData } from '@/hooks/useFinancialData'
import { useTheme } from '@/hooks/useTheme'

describe('useFinancialData', () => {
  it('deve carregar categorias padrão quando não há dados salvos', () => {
    window.localStorage.getItem = jest.fn(() => null)
    
    const { result } = renderHook(() => useFinancialData())
    
    expect(result.current.categories).toBeDefined()
    expect(result.current.categories.length).toBeGreaterThan(0)
  })
  
  it('deve adicionar nova transação', () => {
    const { result } = renderHook(() => useFinancialData())
    
    act(() => {
      result.current.addTransaction({
        id: '1',
        type: 'expense',
        amount: 100,
        description: 'Teste',
        category: 'food',
        date: new Date()
      })
    })
    
    expect(result.current.transactions).toHaveLength(1)
  })
})

describe('useTheme', () => {
  it('deve inicializar com tema dark por padrão', () => {
    const { result } = renderHook(() => useTheme())
    
    expect(result.current.theme).toBe('dark')
  })
  
  it('deve alternar tema corretamente', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.toggleTheme()
    })
    
    expect(result.current.theme).toBe('light')
  })
})
*/
