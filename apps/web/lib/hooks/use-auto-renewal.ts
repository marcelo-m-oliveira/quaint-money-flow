'use client'

import { useEffect } from 'react'

import { RecurringTransactionsService } from '../services/recurring-transactions.service'
import { Transaction } from '../types'

/**
 * Hook para gerenciar renovações automáticas de receitas fixas
 * Executa verificações periódicas e renova automaticamente quando necessário
 */
export function useAutoRenewal() {
  /**
   * Processamento inicial de renovações automáticas
   */
  useEffect(() => {
    // Obter transações diretamente do localStorage para evitar dependência circular
    const getTransactionsFromStorage = (): Transaction[] => {
      try {
        const stored = localStorage.getItem('quaint-money-transactions')
        if (!stored) return []

        return JSON.parse(stored).map(
          (
            t: Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> & {
              date: string
              createdAt: string
              updatedAt: string
              paid?: boolean
            },
          ) => ({
            ...t,
            date: new Date(t.date),
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            paid: t.paid ?? false,
          }),
        )
      } catch (error) {
        console.error('Erro ao carregar transações:', error)
        return []
      }
    }

    const transactions = getTransactionsFromStorage()

    if (transactions.length === 0) {
      return
    }

    // Executar verificação de renovação com delay para evitar conflitos
    const timeoutId = setTimeout(() => {
      try {
        const renewedTransactions =
          RecurringTransactionsService.processAutomaticRenewals(transactions)

        if (renewedTransactions.length > 0) {
          // Adicionar as transações renovadas ao localStorage
          renewedTransactions.forEach((transaction) => {
            const newTransaction = {
              ...transaction,
              id: `${transaction.parentTransactionId || transaction.id}_${transaction.date}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }

            try {
              const currentTransactions = JSON.parse(
                localStorage.getItem('quaint-money-transactions') || '[]',
              )

              // Verificar se a transação já existe para evitar duplicatas
              const exists = currentTransactions.some(
                (t: { id: string }) => t.id === newTransaction.id,
              )

              if (!exists) {
                const updatedTransactions = [
                  ...currentTransactions,
                  newTransaction,
                ]
                localStorage.setItem(
                  'quaint-money-transactions',
                  JSON.stringify(updatedTransactions),
                )

                // Disparar evento customizado para notificar outros hooks
                window.dispatchEvent(
                  new CustomEvent('transactionsUpdated', {
                    detail: { transactions: updatedTransactions },
                  }),
                )
              }
            } catch (error) {
              console.error('Erro ao adicionar transação renovada:', error)
            }
          })

          console.log(
            `✅ ${renewedTransactions.length} receitas fixas foram renovadas automaticamente por mais 3 anos`,
          )
        }
      } catch (error) {
        console.error('Erro ao processar renovações automáticas:', error)
      }
    }, 2000) // 2 segundos de delay

    return () => clearTimeout(timeoutId)
  }, []) // Sem dependências para evitar loops

  /**
   * Verificação periódica (a cada 24 horas)
   */
  useEffect(() => {
    const getTransactionsFromStorage = (): Transaction[] => {
      try {
        const stored = localStorage.getItem('quaint-money-transactions')
        if (!stored) return []

        return JSON.parse(stored).map(
          (
            t: Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> & {
              date: string
              createdAt: string
              updatedAt: string
              paid?: boolean
            },
          ) => ({
            ...t,
            date: new Date(t.date),
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            paid: t.paid ?? false,
          }),
        )
      } catch (error) {
        console.error('Erro ao carregar transações:', error)
        return []
      }
    }

    // Verificar renovações a cada 24 horas
    const intervalId = setInterval(
      () => {
        try {
          // Obter transações atuais do localStorage para evitar dependência circular
          const currentTransactions = getTransactionsFromStorage()

          if (currentTransactions.length === 0) {
            return
          }

          const renewedTransactions =
            RecurringTransactionsService.processAutomaticRenewals(
              currentTransactions,
            )

          if (renewedTransactions.length > 0) {
            console.log(
              `🔄 Verificação periódica: ${renewedTransactions.length} receitas renovadas`,
            )
            // Adicionar as transações renovadas sem recarregar a página
            renewedTransactions.forEach((transaction) => {
              const newTransaction = {
                ...transaction,
                id: `${transaction.parentTransactionId || transaction.id}_${transaction.date}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }

              try {
                const exists = currentTransactions.some(
                  (t: { id: string }) => t.id === newTransaction.id,
                )

                if (!exists) {
                  currentTransactions.push(newTransaction)
                }
              } catch (error) {
                console.error('Erro ao adicionar transação renovada:', error)
              }
            })

            // Salvar as transações atualizadas
            localStorage.setItem(
              'quaint-money-transactions',
              JSON.stringify(currentTransactions),
            )

            // Disparar evento customizado para notificar outros hooks
            window.dispatchEvent(
              new CustomEvent('transactionsUpdated', {
                detail: { transactions: currentTransactions },
              }),
            )
          }
        } catch (error) {
          console.error('Erro na verificação periódica de renovações:', error)
        }
      },
      24 * 60 * 60 * 1000,
    ) // 24 horas

    return () => clearInterval(intervalId)
  }, []) // Sem dependências para evitar loops

  return {
    // Método para forçar verificação manual (se necessário)
    checkRenewals: () => {
      try {
        const stored = localStorage.getItem('quaint-money-transactions')
        if (!stored) return 0

        const transactions = JSON.parse(stored).map(
          (
            t: Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> & {
              date: string
              createdAt: string
              updatedAt: string
              paid?: boolean
            },
          ) => ({
            ...t,
            date: new Date(t.date),
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            paid: t.paid ?? false,
          }),
        )

        const renewedTransactions =
          RecurringTransactionsService.processAutomaticRenewals(transactions)
        return renewedTransactions.length
      } catch (error) {
        console.error('Erro ao verificar renovações:', error)
        return 0
      }
    },
  }
}
