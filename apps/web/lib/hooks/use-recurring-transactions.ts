import { useCallback, useEffect } from 'react'

import { RecurringTransactionsService } from '../services/recurring-transactions.service'
import { Transaction } from '../types'
import { useFinancialData } from './use-financial-data'

/**
 * Hook para gerenciar transações recorrentes
 * Integra o serviço de transações recorrentes com o sistema de dados financeiros
 * Inclui processamento automático de renovações de receitas fixas por 3 anos
 */
export function useRecurringTransactions() {
  const {
    transactions,
    addTransaction,
    updateTransactionStatus,
    deleteTransaction,
  } = useFinancialData()

  /**
   * Processa todas as transações recorrentes e cria as próximas ocorrências
   * Inclui renovação automática de receitas fixas por 3 anos
   */
  const processRecurringTransactions = useCallback(() => {
    try {
      const newTransactions =
        RecurringTransactionsService.processRecurringTransactions(transactions)

      // Adicionar as novas transações ao sistema
      newTransactions.forEach((transaction) => {
        // Converter para o formato esperado pelo addTransaction
        const transactionData = {
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          categoryId: transaction.categoryId,
          accountId: transaction.accountId,
          creditCardId: transaction.creditCardId,
          date: transaction.date,
          paid: transaction.paid,
          isRecurring: transaction.isRecurring,
          recurringType: transaction.recurringType,
          fixedFrequency: transaction.fixedFrequency,
          installmentCount: transaction.installmentCount,
          installmentPeriod: transaction.installmentPeriod,
          currentInstallment: transaction.currentInstallment,
          parentTransactionId: transaction.parentTransactionId,
        }

        // Verificar se a transação já existe antes de adicionar
        const existingTransaction = transactions.find(
          (t) =>
            t.id === transaction.id ||
            (t.parentTransactionId === transaction.parentTransactionId &&
              t.currentInstallment === transaction.currentInstallment &&
              Math.abs(new Date(t.date).getTime() - transaction.date) <
                24 * 60 * 60 * 1000), // mesmo dia
        )

        if (!existingTransaction) {
          // Usar uma versão modificada que não dispara toast para transações automáticas
          addTransactionSilently(transactionData)
        }
      })

      return newTransactions.length
    } catch (error) {
      console.error('Erro ao processar transações recorrentes:', error)
      return 0
    }
  }, [transactions, addTransaction])

  /**
   * Adiciona uma transação sem disparar notificações (para transações automáticas)
   */
  const addTransactionSilently = useCallback(
    (
      data: Partial<Transaction> & {
        amount?: string | number
        date?: string | number
      },
    ) => {
      try {
        const newTransaction: Transaction = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          description: data.description || '',
          amount:
            typeof data.amount === 'string'
              ? parseFloat(data.amount)
              : data.amount || 0,
          type: data.type || 'expense',
          categoryId: data.categoryId || '',
          accountId: data.accountId || undefined,
          creditCardId: data.creditCardId || undefined,
          date:
            typeof data.date === 'string'
              ? new Date(data.date).getTime()
              : data.date || Date.now(),
          paid: data.paid || false,
          isRecurring: data.isRecurring,
          recurringType: data.recurringType,
          fixedFrequency: data.fixedFrequency,
          installmentCount: data.installmentCount,
          installmentPeriod: data.installmentPeriod,
          currentInstallment: data.currentInstallment,
          parentTransactionId: data.parentTransactionId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        // Salvar diretamente no localStorage sem toast
        const currentTransactions = JSON.parse(
          localStorage.getItem('quaint-money-transactions') || '[]',
        )
        const updatedTransactions = [...currentTransactions, newTransaction]
        localStorage.setItem(
          'quaint-money-transactions',
          JSON.stringify(updatedTransactions),
        )
      } catch (error) {
        console.error('Erro ao adicionar transação silenciosamente:', error)
      }
    },
    [transactions],
  )

  /**
   * Processa renovações automáticas para receitas fixas
   * Este método é chamado automaticamente quando necessário
   */
  const processAutomaticRenewals = useCallback(() => {
    try {
      const renewedTransactions =
        RecurringTransactionsService.processAutomaticRenewals(transactions)

      if (renewedTransactions.length > 0) {
        // Adicionar as transações renovadas silenciosamente
        renewedTransactions.forEach((transaction) => {
          const newTransaction = {
            ...transaction,
            id: `${transaction.parentTransactionId || transaction.id}_${transaction.date}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }

          // Salvar diretamente no localStorage sem toast
          try {
            const currentTransactions = JSON.parse(
              localStorage.getItem('quaint-money-transactions') || '[]',
            )
            const updatedTransactions = [...currentTransactions, newTransaction]
            localStorage.setItem(
              'quaint-money-transactions',
              JSON.stringify(updatedTransactions),
            )
          } catch (error) {
            console.error('Erro ao adicionar transação renovada:', error)
          }
        })

        console.log(
          `${renewedTransactions.length} receitas fixas foram renovadas automaticamente por mais 3 anos`,
        )
      }
    } catch (error) {
      console.error('Erro ao processar renovações automáticas:', error)
    }
  }, [transactions])

  /**
   * Processar transações recorrentes na inicialização
   * TEMPORARIAMENTE DESABILITADO para evitar loops infinitos durante interações com a tabela
   */
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     processRecurringTransactions()
  //   }, 2000) // Aguarda 2 segundos após a inicialização

  //   return () => clearTimeout(timer)
  // }, [processRecurringTransactions])

  /**
   * Atualiza o status de uma transação recorrente e cria próximas ocorrências se necessário
   */
  const updateRecurringTransactionStatus = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      const transaction = transactions.find((t) => t.id === id)
      if (!transaction) return

      // Atualizar a transação atual
      updateTransactionStatus(id, updates)

      // Se é uma transação recorrente fixa que foi marcada como paga,
      // criar a próxima ocorrência
      if (
        updates.paid === true &&
        transaction.isRecurring &&
        transaction.recurringType === 'fixed' &&
        !transaction.paid
      ) {
        const newTransactions =
          RecurringTransactionsService.updateRecurringTransactionStatus(
            transaction,
            updates,
          )

        newTransactions.forEach((newTransaction) => {
          const transactionData = {
            description: newTransaction.description,
            amount: newTransaction.amount,
            type: newTransaction.type,
            categoryId: newTransaction.categoryId,
            accountId: newTransaction.accountId,
            creditCardId: newTransaction.creditCardId,
            date: newTransaction.date,
            paid: newTransaction.paid,
            isRecurring: newTransaction.isRecurring,
            recurringType: newTransaction.recurringType,
            fixedFrequency: newTransaction.fixedFrequency,
            installmentCount: newTransaction.installmentCount,
            installmentPeriod: newTransaction.installmentPeriod,
            currentInstallment: newTransaction.currentInstallment,
            parentTransactionId: newTransaction.parentTransactionId,
          }

          addTransactionSilently(transactionData)
        })
      }
    },
    [transactions, updateTransactionStatus, addTransactionSilently],
  )

  /**
   * Cancela todas as transações recorrentes futuras de uma transação base
   */
  const cancelRecurringTransactions = useCallback(
    (baseTransactionId: string) => {
      const transactionsToRemove =
        RecurringTransactionsService.cancelRecurringTransactions(
          baseTransactionId,
          transactions,
        )

      transactionsToRemove.forEach((transactionId) => {
        deleteTransaction(transactionId)
      })

      return transactionsToRemove.length
    },
    [transactions, deleteTransaction],
  )

  /**
   * Processar transações recorrentes na inicialização da aplicação
   * TEMPORARIAMENTE DESABILITADO para debug de loop infinito
   */
  // useEffect(() => {
  //   // Executar uma vez quando o hook é inicializado
  //   const timeoutId = setTimeout(() => {
  //     processRecurringTransactions()
  //   }, 2000) // Aguardar 2 segundos para garantir que os dados foram carregados

  //   return () => clearTimeout(timeoutId)
  // }, []) // Executar apenas uma vez, sem dependências

  return {
    processRecurringTransactions,
    updateRecurringTransactionStatus,
    cancelRecurringTransactions,
    addTransactionSilently,
  }
}
