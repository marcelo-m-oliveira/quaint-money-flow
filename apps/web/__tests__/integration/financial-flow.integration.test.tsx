import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FinancialDashboard } from '@/components/financial-dashboard'
import { render } from '@/__tests__/setup/test-utils'

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock dos hooks
jest.mock('@/lib/hooks/use-financial-data', () => ({
  useFinancialData: () => ({
    categories: [
      { id: '1', name: 'Alimentação', color: '#FF6400', type: 'expense' },
      { id: '2', name: 'Salário', color: '#00FF00', type: 'income' },
    ],
    addTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    updateTransactionStatus: jest.fn(),
    deleteTransaction: jest.fn(),
    deleteCategory: jest.fn(),
    getTotals: () => ({
      totalIncome: 5000,
      totalExpenses: 2500,
      balance: 2500,
    }),
    getTransactionsWithCategories: () => [],
    isLoading: false,
  }),
}))

jest.mock('@/lib/hooks/use-accounts', () => ({
  useAccountsWithAutoInit: () => ({
    accounts: [
      { id: '1', name: 'Conta Principal', balance: 1000 },
    ],
  }),
}))

jest.mock('@/lib/hooks/use-credit-cards', () => ({
  useCreditCardsWithAutoInit: () => ({
    creditCards: [
      { id: '1', name: 'Cartão Principal', limit: 5000 },
    ],
  }),
}))

describe('FinancialDashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar o dashboard com os elementos principais', async () => {
    render(<FinancialDashboard />)

    // Verificar elementos principais do dashboard
    expect(screen.getByText('Quaint Money')).toBeInTheDocument()
    expect(screen.getByText('Despesas no mês atual')).toBeInTheDocument()
    expect(screen.getByText('Receitas no mês atual')).toBeInTheDocument()
    expect(screen.getByText('NOVA DESPESA')).toBeInTheDocument()
    expect(screen.getByText('NOVA RECEITA')).toBeInTheDocument()
  })

  it('deve abrir o modal de nova despesa', async () => {
    const user = userEvent.setup()
    render(<FinancialDashboard />)

    // Abrir modal de nova despesa
    const newExpenseButton = screen.getByText('NOVA DESPESA')
    await user.click(newExpenseButton)

    await waitFor(() => {
      expect(screen.getByText('Nova despesa')).toBeInTheDocument()
    })

    // Verificar se o formulário está presente
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument()
  })

  it('deve abrir o modal de nova receita', async () => {
    const user = userEvent.setup()
    render(<FinancialDashboard />)

    // Abrir modal de nova receita
    const newIncomeButton = screen.getByText('NOVA RECEITA')
    await user.click(newIncomeButton)

    await waitFor(() => {
      expect(screen.getByText('Nova receita')).toBeInTheDocument()
    })

    // Verificar se o formulário está presente
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument()
  })

  it('deve permitir alternar entre temas', async () => {
    const user = userEvent.setup()
    render(<FinancialDashboard />)

    // Verificar tema inicial (dark por padrão)
    expect(document.documentElement).toHaveClass('dark')
    
    // Encontrar o botão de configurações (primeiro botão com ícone de settings)
    const settingsButtons = screen.getAllByRole('button')
    const settingsButton = settingsButtons.find(button => 
      button.querySelector('svg[class*="settings"]')
    )
    
    expect(settingsButton).toBeDefined()
    await user.click(settingsButton!)
    
    // Alternar para tema claro
    const lightThemeOption = screen.getByText('Claro')
    await user.click(lightThemeOption)
    
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light')
    })
    
    // Voltar para tema escuro
    await user.click(settingsButton!)
    const darkThemeOption = screen.getByText('Escuro')
    await user.click(darkThemeOption)
    
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
    })
  })

  it('deve mostrar os totais financeiros corretos', () => {
    render(<FinancialDashboard />)

    // Verificar se os labels dos totais estão sendo exibidos
    expect(screen.getByText('Receitas no mês atual')).toBeInTheDocument()
    expect(screen.getByText('Despesas no mês atual')).toBeInTheDocument()
  })
})
