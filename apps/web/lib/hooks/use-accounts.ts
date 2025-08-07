'use client'

import { useEffect, useState } from 'react'

import { Account, AccountFormData } from '../types'
import { useCrudToast } from './use-crud-toast'

const STORAGE_KEY = 'quaint-money-accounts'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { success, error } = useCrudToast()

  // Carregar contas do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedAccounts = JSON.parse(stored)
        setAccounts(
          parsedAccounts.map(
            (
              account: Omit<Account, 'createdAt' | 'updatedAt'> & {
                createdAt: string
                updatedAt: string
              },
            ) => ({
              ...account,
              createdAt: new Date(account.createdAt),
              updatedAt: new Date(account.updatedAt),
            }),
          ),
        )
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Salvar contas no localStorage
  const saveAccounts = (newAccounts: Account[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts))
      setAccounts(newAccounts)
    } catch (error) {
      console.error('Erro ao salvar contas:', error)
    }
  }

  // Adicionar nova conta
  const addAccount = (accountData: AccountFormData) => {
    try {
      const newAccount: Account = {
        id: crypto.randomUUID(),
        ...accountData,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedAccounts = [...accounts, newAccount]
      saveAccounts(updatedAccounts)
      success.create('Conta')
      return newAccount
    } catch (err) {
      error.create('conta')
      throw err
    }
  }

  // Atualizar conta existente
  const updateAccount = (id: string, accountData: Partial<AccountFormData>) => {
    try {
      const updatedAccounts = accounts.map((account) =>
        account.id === id
          ? {
              ...account,
              ...accountData,
              updatedAt: new Date(),
            }
          : account,
      )
      saveAccounts(updatedAccounts)
      success.update('Conta')
    } catch (err) {
      error.update('conta')
    }
  }

  // Remover conta
  const deleteAccount = (id: string) => {
    try {
      const updatedAccounts = accounts.filter((account) => account.id !== id)
      saveAccounts(updatedAccounts)
      success.delete('Conta')
    } catch (err) {
      error.delete('conta')
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
  }
}
