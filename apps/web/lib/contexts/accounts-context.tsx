'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

import { Account, AccountFormData, accountsService, useCrudToast } from '@/lib'

interface AccountsContextType {
  accounts: Account[]
  isLoading: boolean
  isInitialized: boolean
  addAccount: (accountData: AccountFormData) => Promise<Account>
  updateAccount: (
    id: string,
    accountData: Partial<AccountFormData>,
  ) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  getAccountById: (id: string) => Account | undefined
  refetch: () => Promise<void>
  initialize: () => Promise<void>
}

const AccountsContext = createContext<AccountsContextType | undefined>(
  undefined,
)

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { success, error } = useCrudToast()

  // Carregar contas da API
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await accountsService.getAll()
      const accountsWithDates = response.accounts.map((account) => ({
        ...account,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      }))
      setAccounts(accountsWithDates)
      setIsInitialized(true)
    } catch (err) {
      console.error('Erro ao carregar contas:', err)
      // Removido error.read para evitar dependências desnecessárias
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Inicializar contas apenas quando necessário
  const initialize = useCallback(async () => {
    if (!isInitialized && !isLoading) {
      await loadAccounts()
    }
  }, [isInitialized, isLoading, loadAccounts])

  // Remover carregamento automático - será carregado apenas quando necessário
  // useEffect(() => {
  //   loadAccounts()
  // }, [loadAccounts])

  // Adicionar nova conta
  const addAccount = async (accountData: AccountFormData): Promise<Account> => {
    console.log('AccountsContext: addAccount called with data:', accountData)
    try {
      console.log('AccountsContext: calling accountsService.create')
      const newAccount = await accountsService.create(accountData)
      console.log('AccountsContext: account created successfully:', newAccount)
      const accountWithDates = {
        ...newAccount,
        createdAt: newAccount.createdAt,
        updatedAt: newAccount.updatedAt,
      }
      setAccounts((prev) => [...prev, accountWithDates])
      success.create('Conta')
      return accountWithDates
    } catch (err) {
      console.error('AccountsContext: error creating account:', err)
      error.create('conta')
      throw err
    }
  }

  // Atualizar conta existente
  const updateAccount = async (
    id: string,
    accountData: Partial<AccountFormData>,
  ) => {
    try {
      const updatedAccount = await accountsService.update(id, accountData)
      const accountWithDates = {
        ...updatedAccount,
        createdAt: updatedAccount.createdAt,
        updatedAt: updatedAccount.updatedAt,
      }
      setAccounts((prev) =>
        prev.map((account) => (account.id === id ? accountWithDates : account)),
      )
      success.update('Conta')
    } catch (err) {
      error.update('conta')
      throw err
    }
  }

  // Remover conta
  const deleteAccount = async (id: string) => {
    try {
      await accountsService.delete(id)
      setAccounts((prev) => prev.filter((account) => account.id !== id))
      success.delete('Conta')
    } catch (err) {
      error.delete('conta')
      throw err
    }
  }

  // Obter conta por ID
  const getAccountById = (id: string) => {
    return accounts.find((account) => account.id === id)
  }

  const value: AccountsContextType = {
    accounts,
    isLoading,
    isInitialized,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    refetch: loadAccounts,
    initialize,
  }

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts() {
  const context = useContext(AccountsContext)
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountsProvider')
  }
  return context
}
