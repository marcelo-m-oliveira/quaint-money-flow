import { addDays, addMonths, addQuarters, addWeeks, addYears } from 'date-fns'

import { Transaction } from '../types'

/**
 * Serviço para processamento automático de transações recorrentes
 * Inclui sistema de renovação automática de receitas fixas por 3 anos
 */
export class RecurringTransactionsService {
  // Constante para limite de recorrência (3 anos)
  private static readonly RECURRING_LIMIT_YEARS = 3

  // Chave para armazenar informações de renovação no localStorage
  private static readonly RENEWAL_STORAGE_KEY = 'recurring-renewals'
  /**
   * Processa todas as transações recorrentes e cria as próximas ocorrências
   * até a data alvo especificada. Para receitas fixas, implementa renovação automática de 3 anos.
   */
  static processRecurringTransactions(
    transactions: Transaction[],
    targetDate: Date = addYears(new Date(), this.RECURRING_LIMIT_YEARS),
  ): Transaction[] {
    const newTransactions: Transaction[] = []

    for (const transaction of transactions) {
      if (transaction.isRecurring && !transaction.parentTransactionId) {
        // Processar transações recorrentes base (não filhas)
        if (transaction.recurringType === 'fixed') {
          // Para receitas fixas, verificar se precisa renovar automaticamente
          const shouldRenew = this.shouldRenewFixedTransaction(
            transaction,
            transactions,
          )
          const currentTargetDate = shouldRenew
            ? addYears(new Date(), this.RECURRING_LIMIT_YEARS)
            : targetDate

          const fixedTransactions = this.createFixedRecurringTransactions(
            transaction,
            currentTargetDate,
          )
          newTransactions.push(...fixedTransactions)

          // Registrar renovação se necessário
          if (shouldRenew) {
            this.registerRenewal(transaction.id)
          }
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

    // Obter todas as transações existentes para verificação
    const allExistingTransactions = this.getAllTransactions()

    while (currentDate <= targetDate) {
      const targetTimestamp = currentDate.getTime()

      // Verificar se já existe uma transação para esta data
      const existingTransaction = this.findExistingTransaction(
        baseTransaction.id,
        targetTimestamp,
        allExistingTransactions,
      )

      if (!existingTransaction) {
        const newTransaction: Transaction = {
          ...baseTransaction,
          id: `${baseTransaction.id}_${targetTimestamp}`,
          date: targetTimestamp,
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
    // Para a primeira parcela (installmentNumber = 1), usar a data base
    // Para as demais, calcular com base no período
    const periodsToAdd = installmentNumber - 1

    switch (period) {
      case 'days':
        return addDays(baseDate, periodsToAdd)
      case 'weeks':
        return addWeeks(baseDate, periodsToAdd)
      case 'biweeks':
        return addWeeks(baseDate, periodsToAdd * 2)
      case 'months':
        return addMonths(baseDate, periodsToAdd)
      case 'bimonths':
        return addMonths(baseDate, periodsToAdd * 2)
      case 'quarters':
        return addQuarters(baseDate, periodsToAdd)
      case 'semesters':
        return addMonths(baseDate, periodsToAdd * 6)
      case 'years':
        return addYears(baseDate, periodsToAdd)
      default:
        return baseDate
    }
  }

  /**
   * Verifica se já existe uma transação recorrente para a data especificada
   */
  private static findExistingTransaction(
    parentId: string,
    targetDate: number,
    allTransactions: Transaction[],
  ): boolean {
    return allTransactions.some(
      (t) =>
        t.parentTransactionId === parentId &&
        Math.abs(t.date - targetDate) < 24 * 60 * 60 * 1000, // Mesmo dia
    )
  }

  /**
   * Verifica se uma transação fixa precisa ser renovada automaticamente
   * Critério: se não há transações futuras suficientes (próximos 6 meses)
   */
  private static shouldRenewFixedTransaction(
    baseTransaction: Transaction,
    allTransactions: Transaction[],
  ): boolean {
    if (
      baseTransaction.recurringType !== 'fixed' ||
      !baseTransaction.fixedFrequency
    ) {
      return false
    }

    // Buscar todas as transações filhas desta transação base
    const childTransactions = allTransactions.filter(
      (t) => t.parentTransactionId === baseTransaction.id,
    )

    if (childTransactions.length === 0) {
      return true // Primeira vez, precisa criar as recorrências
    }

    // Verificar se há transações futuras suficientes (próximos 6 meses)
    const now = new Date()
    const futureThreshold = addMonths(now, 6)

    const futureTransactions = childTransactions.filter(
      (t) => new Date(t.date) > futureThreshold,
    )

    // Se há menos de 3 transações futuras além dos próximos 6 meses, renovar
    return futureTransactions.length < 3
  }

  /**
   * Registra uma renovação no localStorage para controle
   */
  private static registerRenewal(transactionId: string): void {
    try {
      const renewals = this.getRenewals()
      const renewalRecord = {
        transactionId,
        renewedAt: Date.now(),
        renewalCount: (renewals[transactionId]?.renewalCount || 0) + 1,
      }

      renewals[transactionId] = renewalRecord
      localStorage.setItem(this.RENEWAL_STORAGE_KEY, JSON.stringify(renewals))
    } catch (error) {
      console.error('Erro ao registrar renovação:', error)
    }
  }

  /**
   * Obtém os registros de renovação do localStorage
   */
  private static getRenewals(): Record<
    string,
    { transactionId: string; renewedAt: number; renewalCount: number }
  > {
    try {
      const stored = localStorage.getItem(this.RENEWAL_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Erro ao obter renovações:', error)
      return {}
    }
  }

  /**
   * Obtém todas as transações do localStorage para verificação
   */
  private static getAllTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem('quaint-money-transactions')
      if (!stored) return []

      return JSON.parse(stored).map((t: Transaction) => ({
        ...t,
        date: typeof t.date === 'string' ? new Date(t.date).getTime() : t.date,
        createdAt:
          typeof t.createdAt === 'string'
            ? new Date(t.createdAt).getTime()
            : t.createdAt,
        updatedAt:
          typeof t.updatedAt === 'string'
            ? new Date(t.updatedAt).getTime()
            : t.updatedAt,
      }))
    } catch (error) {
      console.error('Erro ao obter transações:', error)
      return []
    }
  }

  /**
   * Processa renovações automáticas para todas as receitas fixas que precisam
   * Este método deve ser chamado periodicamente (ex: ao inicializar a aplicação)
   */
  static processAutomaticRenewals(transactions: Transaction[]): Transaction[] {
    const newTransactions: Transaction[] = []

    // Filtrar apenas transações fixas base (não filhas)
    const baseFixedTransactions = transactions.filter(
      (t) =>
        t.isRecurring && t.recurringType === 'fixed' && !t.parentTransactionId,
    )

    for (const baseTransaction of baseFixedTransactions) {
      // Verificar se não foi renovada recentemente (proteção contra loops)
      const renewals = this.getRenewals()
      const lastRenewal = renewals[baseTransaction.id]

      if (lastRenewal) {
        const timeSinceLastRenewal = Date.now() - lastRenewal.renewedAt
        const oneHourInMs = 60 * 60 * 1000

        // Não renovar se foi renovada há menos de 1 hora
        if (timeSinceLastRenewal < oneHourInMs) {
          continue
        }

        // Limitar número máximo de renovações (proteção adicional)
        if (lastRenewal.renewalCount >= 50) {
          console.warn(
            `Transação ${baseTransaction.id} atingiu limite máximo de renovações`,
          )
          continue
        }
      }

      if (this.shouldRenewFixedTransaction(baseTransaction, transactions)) {
        // Criar novas ocorrências para os próximos 3 anos
        const renewalDate = new Date()
        const targetDate = addYears(renewalDate, this.RECURRING_LIMIT_YEARS)

        const renewedTransactions = this.createFixedRecurringTransactions(
          baseTransaction,
          targetDate,
        )

        // Verificar se realmente foram criadas novas transações
        if (renewedTransactions.length > 0) {
          newTransactions.push(...renewedTransactions)
          this.registerRenewal(baseTransaction.id)
        }
      }
    }

    return newTransactions
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
  // Para a primeira parcela (installmentNumber = 1), usar a data base
  // Para as demais, calcular com base no período
  const periodsToAdd = installmentNumber - 1

  switch (installmentPeriod) {
    case 'days':
      return addDays(baseDate, periodsToAdd)
    case 'weeks':
      return addWeeks(baseDate, periodsToAdd)
    case 'biweeks':
      return addWeeks(baseDate, periodsToAdd * 2)
    case 'months':
      return addMonths(baseDate, periodsToAdd)
    case 'bimonths':
      return addMonths(baseDate, periodsToAdd * 2)
    case 'quarters':
      return addQuarters(baseDate, periodsToAdd)
    case 'semesters':
      return addMonths(baseDate, periodsToAdd * 6)
    case 'years':
      return addYears(baseDate, periodsToAdd)
    default:
      return baseDate
  }
}
