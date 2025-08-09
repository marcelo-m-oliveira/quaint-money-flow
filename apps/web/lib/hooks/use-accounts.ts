'use client'

import { useCallback, useEffect, useState } from 'react'

import { accountsService } from '../services/accounts'
import { Account, AccountFormData } from '../types'
import { useCrudToast } from './use-crud-toast'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { success, error } = useCrudToast()

  // Carregar contas da API
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await accountsService.getAll()
      const accountsWithDates = response.accounts.map((account) => ({
        ...account,
        createdAt: new Date(account.createdAt),
        updatedAt: new Date(account.updatedAt),
      }))
      setAccounts(accountsWithDates)
    } catch (err) {
      console.error('Erro ao carregar contas:', err)
      error.read('contas')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  // Adicionar nova conta
  const addAccount = async (accountData: AccountFormData) => {
    try {
      const newAccount = await accountsService.create(accountData)
      const accountWithDates = {
        ...newAccount,
        createdAt: new Date(newAccount.createdAt),
        updatedAt: new Date(newAccount.updatedAt),
      }
      setAccounts((prev) => [...prev, accountWithDates])
      success.create('Conta')
      return accountWithDates
    } catch (err) {
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
        createdAt: new Date(updatedAccount.createdAt),
        updatedAt: new Date(updatedAccount.updatedAt),
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

  return {
    accounts,
    isLoading,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    refetch: loadAccounts,
  }
}
