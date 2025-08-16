'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

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
      const accountsWithDates = response.data.map((account) => ({
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
    // Verificar estado atual diretamente para evitar dependências desnecessárias
    if (!isInitialized && !isLoading) {
      await loadAccounts()
    }
  }, [loadAccounts]) // Remover isInitialized e isLoading das dependências

  // Remover carregamento automático - será carregado apenas quando necessário
  // useEffect(() => {
  //   loadAccounts()
  // }, [loadAccounts])

  // Adicionar nova conta
  const addAccount = useCallback(
    async (accountData: AccountFormData): Promise<Account> => {
      console.log('AccountsContext: addAccount called with data:', accountData)
      try {
        console.log('AccountsContext: calling accountsService.create')
        const newAccount = await accountsService.create(accountData)
        console.log(
          'AccountsContext: account created successfully:',
          newAccount,
        )
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
    },
    [success, error],
  )

  // Atualizar conta existente
  const updateAccount = useCallback(
    async (id: string, accountData: Partial<AccountFormData>) => {
      try {
        const updatedAccount = await accountsService.update(id, accountData)
        const accountWithDates = {
          ...updatedAccount,
          createdAt: updatedAccount.createdAt,
          updatedAt: updatedAccount.updatedAt,
        }
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === id ? accountWithDates : account,
          ),
        )
        success.update('Conta')
      } catch (err) {
        error.update('conta')
        throw err
      }
    },
    [success, error],
  )

  // Remover conta
  const deleteAccount = useCallback(
    async (id: string) => {
      try {
        await accountsService.delete(id)
        setAccounts((prev) => prev.filter((account) => account.id !== id))
        success.delete('Conta')
      } catch (err) {
        error.delete('conta')
        throw err
      }
    },
    [success, error],
  )

  // Obter conta por ID
  const getAccountById = useCallback(
    (id: string) => {
      return accounts.find((account) => account.id === id)
    },
    [accounts],
  )

  const value: AccountsContextType = useMemo(
    () => ({
      accounts,
      isLoading,
      isInitialized,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccountById,
      refetch: loadAccounts,
      initialize,
    }),
    [
      accounts,
      isLoading,
      isInitialized,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccountById,
      loadAccounts,
      initialize,
    ],
  )

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
