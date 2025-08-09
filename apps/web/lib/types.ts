export interface Category {
  id: string
  name: string
  color: string
  type: 'income' | 'expense'
  icon: string
  parentId?: string // Para subcategorias
  createdAt: Date
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
  type: 'bank' | 'credit_card' | 'investment' | 'cash' | 'other'
  icon: string
  iconType: 'bank' | 'generic'
  balance: number
  includeInGeneralBalance: boolean
  createdAt: Date
  updatedAt: Date
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
  currentBalance: number
  closingDay: number // Dia do fechamento da fatura (1-31)
  dueDay: number // Dia do vencimento da fatura (1-31)
  defaultPaymentAccountId?: string // ID da conta padrão para pagamento
  createdAt: Date
  updatedAt: Date
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
