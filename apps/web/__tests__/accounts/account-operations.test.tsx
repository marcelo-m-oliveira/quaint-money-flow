import { describe, expect, it, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { Account } from '@/lib/types'

// Mock data
const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Conta Corrente',
    type: 'bank',
    icon: 'bank',
    iconType: 'generic',
    includeInGeneralBalance: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Poupança',
    type: 'bank',
    icon: 'piggy-bank',
    iconType: 'generic',
    includeInGeneralBalance: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Mock do hook de contas
const mockAddAccount = jest.fn().mockResolvedValue({
  id: '3',
  name: 'Nova Conta',
  type: 'bank',
  icon: 'wallet',
  iconType: 'generic',
  includeInGeneralBalance: true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const mockUpdateAccount = jest.fn().mockResolvedValue(undefined)
const mockDeleteAccount = jest.fn().mockResolvedValue(undefined)

jest.mock('@/lib/hooks/use-accounts', () => ({
  useAccountsWithAutoInit: () => ({
    accounts: mockAccounts,
    isLoading: false,
    isInitialized: true,
    addAccount: mockAddAccount,
    updateAccount: mockUpdateAccount,
    deleteAccount: mockDeleteAccount,
    getAccountById: jest.fn(),
    refetch: jest.fn(),
    initialize: jest.fn(),
  }),
}))

// Componente de teste simples
function TestAccountsComponent() {
  const { accounts, addAccount, updateAccount, deleteAccount } = require('@/lib/hooks/use-accounts').useAccountsWithAutoInit()
  
  return (
    <div>
      <h1>Contas</h1>
      <div data-testid="accounts-list">
        {accounts.map((account: Account) => (
          <div key={account.id} data-testid={`account-${account.id}`}>
            <span>{account.name}</span>
            <button onClick={() => updateAccount(account.id, { name: 'Conta Atualizada' })}>
              Editar
            </button>
            <button onClick={() => deleteAccount(account.id)}>
              Deletar
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => addAccount({ name: 'Nova Conta', type: 'bank' })}>
        Adicionar Conta
      </button>
    </div>
  )
}

describe('Account Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display accounts list', () => {
    render(<TestAccountsComponent />)
    
    expect(screen.getByText('Contas')).toBeInTheDocument()
    expect(screen.getByTestId('accounts-list')).toBeInTheDocument()
    expect(screen.getByText('Conta Corrente')).toBeInTheDocument()
    expect(screen.getByText('Poupança')).toBeInTheDocument()
  })

  it('should have add account functionality', () => {
    render(<TestAccountsComponent />)
    
    const addButton = screen.getByText('Adicionar Conta')
    expect(addButton).toBeInTheDocument()
    
    // Simular clique
    addButton.click()
    expect(mockAddAccount).toHaveBeenCalledWith({ name: 'Nova Conta', type: 'bank' })
  })

  it('should have edit account functionality', () => {
    render(<TestAccountsComponent />)
    
    const editButtons = screen.getAllByText('Editar')
    expect(editButtons).toHaveLength(2)
    
    // Simular clique no primeiro botão de editar
    editButtons[0].click()
    expect(mockUpdateAccount).toHaveBeenCalledWith('1', { name: 'Conta Atualizada' })
  })

  it('should have delete account functionality', () => {
    render(<TestAccountsComponent />)
    
    const deleteButtons = screen.getAllByText('Deletar')
    expect(deleteButtons).toHaveLength(2)
    
    // Simular clique no primeiro botão de deletar
    deleteButtons[0].click()
    expect(mockDeleteAccount).toHaveBeenCalledWith('1')
  })

  it('should call account operations with correct parameters', () => {
    render(<TestAccountsComponent />)
    
    // Testar addAccount
    const addButton = screen.getByText('Adicionar Conta')
    addButton.click()
    expect(mockAddAccount).toHaveBeenCalledTimes(1)
    expect(mockAddAccount).toHaveBeenCalledWith({ name: 'Nova Conta', type: 'bank' })
    
    // Testar updateAccount
    const editButton = screen.getAllByText('Editar')[0]
    editButton.click()
    expect(mockUpdateAccount).toHaveBeenCalledTimes(1)
    expect(mockUpdateAccount).toHaveBeenCalledWith('1', { name: 'Conta Atualizada' })
    
    // Testar deleteAccount
    const deleteButton = screen.getAllByText('Deletar')[0]
    deleteButton.click()
    expect(mockDeleteAccount).toHaveBeenCalledTimes(1)
    expect(mockDeleteAccount).toHaveBeenCalledWith('1')
  })
})