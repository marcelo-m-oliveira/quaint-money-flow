export interface Category {
  id?: string
  name: string
  color: string
  type: 'income' | 'expense'
  icon: string
  parentId?: string // Para subcategorias
  createdAt: number // Timestamp em segundos
  updatedAt?: number // Timestamp em segundos
  parent?: {
    id: string
    name: string
    color: string
    icon: string
  }
  children?: Array<{
    id: string
    name: string
    color: string
    icon: string
    type: 'income' | 'expense'
  }>
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  category?: Category
  accountId?: string // ID da conta relacionada
  creditCardId?: string // ID do cartão de crédito relacionado
  date: number // Timestamp em milissegundos
  paid: boolean // Indica se o lançamento foi pago ou não
  createdAt: number // Timestamp em milissegundos
  updatedAt: number // Timestamp em milissegundos
}

export interface TransactionFormData {
  description: string
  amount: string
  type: 'income' | 'expense'
  categoryId: string
  accountId?: string // ID da conta relacionada
  creditCardId?: string // ID do cartão de crédito relacionado
  date: string
  paid: boolean // Indica se o lançamento foi pago ou não
}

export interface CategoryFormData {
  name: string
  color: string
  type: 'income' | 'expense'
  icon: string
  parentId?: string // Para subcategorias
}

export interface Account {
  id: string
  name: string
  type: 'bank' | 'investment' | 'cash' | 'other'
  icon: string
  iconType: 'bank' | 'generic'
  balance: number
  includeInGeneralBalance: boolean
  createdAt: number // Timestamp em segundos
  updatedAt?: number // Timestamp em segundos
}

export interface AccountFormData {
  name: string
  type: 'bank' | 'investment' | 'cash' | 'other'
  icon: string
  iconType: 'bank' | 'generic'
  includeInGeneralBalance: boolean
}

// Tipos específicos para cartões de crédito
export interface CreditCard {
  id: string
  name: string
  icon: string
  iconType: 'bank' | 'generic'
  limit: number
  usage: number // Valor usado no cartão (calculado pelas transações)
  closingDay: number // Dia do fechamento da fatura (1-31)
  dueDay: number // Dia do vencimento da fatura (1-31)
  defaultPaymentAccountId?: string // ID da conta padrão para pagamento
  createdAt: number // Timestamp em segundos
  updatedAt?: number // Timestamp em segundos
}

export interface CreditCardFormData {
  name: string
  icon: string
  iconType: 'bank' | 'generic'
  limit: string
  closingDay: number
  dueDay: number
  defaultPaymentAccountId?: string
}

export interface BankIcon {
  id: string
  icon: string
  name: string
  logo: string
  searchTerms: string[]
}

// Tipos para preferências do usuário
export interface UserPreferences {
  id: string
  userId: string
  transactionOrder: 'ascending' | 'descending'
  defaultNavigationPeriod:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
  showDailyBalance: boolean
  viewMode: 'all' | 'cashflow'
  isFinancialSummaryExpanded: boolean
  createdAt: number // Timestamp em segundos
  updatedAt?: number // Timestamp em segundos
}

export interface UserPreferencesFormData {
  transactionOrder?: 'ascending' | 'descending'
  defaultNavigationPeriod?:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
  showDailyBalance?: boolean
  viewMode?: 'all' | 'cashflow'
  isFinancialSummaryExpanded?: boolean
}
