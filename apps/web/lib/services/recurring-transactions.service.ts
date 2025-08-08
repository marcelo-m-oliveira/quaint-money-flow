import { addDays, addMonths, addQuarters, addWeeks, addYears } from 'date-fns'

import { Transaction } from '../types'

/**
 * Serviço para processamento automático de transações recorrentes
 */
export class RecurringTransactionsService {
  /**
   * Processa todas as transações recorrentes e cria as próximas ocorrências
   * até a data alvo especificada
   */
  static processRecurringTransactions(
    transactions: Transaction[],
    targetDate: Date = addMonths(new Date(), 12),
  ): Transaction[] {
    const newTransactions: Transaction[] = []

    for (const transaction of transactions) {
      if (transaction.isRecurring && !transaction.parentTransactionId) {
        // Processar transações recorrentes base (não filhas)
        if (transaction.recurringType === 'fixed') {
          const fixedTransactions = this.createFixedRecurringTransactions(
            transaction,
            targetDate,
          )
          newTransactions.push(...fixedTransactions)
        } else if (transaction.recurringType === 'installment') {
          const installmentTransactions = this.createInstallmentTransactions(
            transaction,
            targetDate,
          )
          newTransactions.push(...installmentTransactions)
        }
      }
    }

    return newTransactions
  }

  /**
   * Cria transações recorrentes fixas (mensais, semanais, etc.)
   */
  private static createFixedRecurringTransactions(
    baseTransaction: Transaction,
    targetDate: Date,
  ): Transaction[] {
    if (
      !baseTransaction.fixedFrequency ||
      baseTransaction.recurringType !== 'fixed'
    ) {
      return []
    }

    const newTransactions: Transaction[] = []
    const baseDate = new Date(baseTransaction.date)
    let currentDate = this.getNextOccurrenceDate(
      baseDate,
      baseTransaction.fixedFrequency,
    )

    while (currentDate <= targetDate) {
      // Verificar se já existe uma transação para esta data
      const existingTransaction = this.findExistingTransaction()

      if (!existingTransaction) {
        const newTransaction: Transaction = {
          ...baseTransaction,
          id: `${baseTransaction.id}_${currentDate.getTime()}`,
          date: currentDate.getTime(),
          paid: false, // Transações futuras começam como não pagas
          createdAt: Date.now(),
          updatedAt: Date.now(),
          parentTransactionId: baseTransaction.id,
        }

        newTransactions.push(newTransaction)
      }

      currentDate = this.getNextOccurrenceDate(
        currentDate,
        baseTransaction.fixedFrequency,
      )
    }

    return newTransactions
  }

  /**
   * Cria transações de parcelas (installments)
   */
  private static createInstallmentTransactions(
    baseTransaction: Transaction,
    targetDate: Date,
  ): Transaction[] {
    if (
      !baseTransaction.installmentCount ||
      !baseTransaction.installmentPeriod ||
      !baseTransaction.currentInstallment
    ) {
      return []
    }

    const newTransactions: Transaction[] = []
    const baseDate = new Date(baseTransaction.date)
    const currentInstallment = baseTransaction.currentInstallment || 1

    for (
      let i = currentInstallment + 1;
      i <= baseTransaction.installmentCount;
      i++
    ) {
      const installmentDate = this.getInstallmentDate(
        baseDate,
        i - 1,
        baseTransaction.installmentPeriod,
      )

      if (installmentDate > targetDate) break

      // Verificar se já existe esta parcela
      const existingInstallment = this.findExistingInstallment()

      if (!existingInstallment) {
        const installmentTransaction: Transaction = {
          ...baseTransaction,
          id: `${baseTransaction.id}_installment_${i}`,
          date: installmentDate.getTime(),
          currentInstallment: i,
          parentTransactionId:
            baseTransaction.parentTransactionId || baseTransaction.id,
          paid: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        newTransactions.push(installmentTransaction)
      }
    }

    return newTransactions
  }

  /**
   * Calcula a próxima data de ocorrência para transações fixas
   */
  private static getNextOccurrenceDate(
    currentDate: Date,
    frequency: NonNullable<Transaction['fixedFrequency']>,
  ): Date {
    switch (frequency) {
      case 'daily':
        return addDays(currentDate, 1)
      case 'weekly':
        return addWeeks(currentDate, 1)
      case 'monthly':
        return addMonths(currentDate, 1)
      case 'quarterly':
        return addQuarters(currentDate, 1)
      case 'annual':
        return addYears(currentDate, 1)
      default:
        return currentDate
    }
  }

  /**
   * Calcula a data de uma parcela específica
   */
  private static getInstallmentDate(
    baseDate: Date,
    installmentNumber: number,
    period: NonNullable<Transaction['installmentPeriod']>,
  ): Date {
    switch (period) {
      case 'months':
        return addMonths(baseDate, installmentNumber)
      case 'weeks':
        return addWeeks(baseDate, installmentNumber)
      case 'years':
        return addYears(baseDate, installmentNumber)
      default:
        return baseDate
    }
  }

  /**
   * Verifica se já existe uma transação recorrente para a data especificada
   */
  private static findExistingTransaction(): boolean {
    // Esta função seria implementada para verificar no localStorage ou banco de dados
    // se já existe uma transação com o mesmo parentTransactionId para a data
    // Por enquanto, retorna false para permitir a criação
    return false
  }

  /**
   * Verifica se já existe uma parcela específica
   */
  private static findExistingInstallment(): boolean {
    // Esta função seria implementada para verificar no localStorage ou banco de dados
    // se já existe uma parcela com o mesmo parentTransactionId e currentInstallment
    // Por enquanto, retorna false para permitir a criação
    return false
  }

  /**
   * Atualiza o status de uma transação recorrente
   * Quando uma transação fixa é marcada como paga, pode criar a próxima ocorrência
   */
  static updateRecurringTransactionStatus(
    transaction: Transaction,
    updates: Partial<Transaction>,
  ): Transaction[] {
    const newTransactions: Transaction[] = []

    // Se a transação foi marcada como paga e é recorrente fixa
    if (
      updates.paid === true &&
      transaction.isRecurring &&
      transaction.recurringType === 'fixed' &&
      !transaction.paid
    ) {
      // Criar a próxima ocorrência
      const nextOccurrence = this.createNextFixedOccurrence(transaction)
      if (nextOccurrence) {
        newTransactions.push(nextOccurrence)
      }
    }

    return newTransactions
  }

  /**
   * Cria a próxima ocorrência de uma transação fixa
   */
  private static createNextFixedOccurrence(
    transaction: Transaction,
  ): Transaction | null {
    if (!transaction.fixedFrequency) return null

    const currentDate = new Date(transaction.date)
    const nextDate = this.getNextOccurrenceDate(
      currentDate,
      transaction.fixedFrequency,
    )

    return {
      ...transaction,
      id: `${transaction.parentTransactionId || transaction.id}_${nextDate.getTime()}`,
      date: nextDate.getTime(),
      paid: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      parentTransactionId: transaction.parentTransactionId || transaction.id,
    }
  }

  /**
   * Remove transações recorrentes futuras quando a transação base é cancelada
   */
  static cancelRecurringTransactions(
    baseTransactionId: string,
    allTransactions: Transaction[],
  ): string[] {
    const currentDate = new Date()

    // Encontrar todas as transações filhas futuras
    const childTransactions = allTransactions.filter(
      (t) =>
        t.parentTransactionId === baseTransactionId &&
        new Date(t.date) > currentDate &&
        !t.paid,
    )

    return childTransactions.map((t) => t.id)
  }
}

// Funções auxiliares exportadas para uso externo
export function createInstallmentTransactions(
  baseTransaction: Transaction,
): Transaction[] {
  if (
    !baseTransaction.isRecurring ||
    baseTransaction.recurringType !== 'installment' ||
    !baseTransaction.installmentCount ||
    !baseTransaction.installmentPeriod
  ) {
    return []
  }

  const transactions: Transaction[] = []
  const baseDate = new Date(baseTransaction.date)

  for (let i = 1; i <= baseTransaction.installmentCount; i++) {
    if (i === 1) {
      // A primeira parcela é a transação original
      continue
    }

    const installmentDate = getInstallmentDate(
      baseDate,
      i,
      baseTransaction.installmentPeriod,
    )

    const installmentTransaction: Transaction = {
      ...baseTransaction,
      id: `${baseTransaction.id}_installment_${i}`,
      date: installmentDate.getTime(),
      currentInstallment: i,
      parentTransactionId: baseTransaction.id,
      paid: false,
    }

    transactions.push(installmentTransaction)
  }

  return transactions
}

export function getInstallmentDate(
  baseDate: Date,
  installmentNumber: number,
  installmentPeriod: NonNullable<Transaction['installmentPeriod']>,
): Date {
  switch (installmentPeriod) {
    case 'months':
      return addMonths(baseDate, installmentNumber)
    case 'weeks':
      return addWeeks(baseDate, installmentNumber)
    case 'years':
      return addYears(baseDate, installmentNumber)
    default:
      return baseDate
  }
}
