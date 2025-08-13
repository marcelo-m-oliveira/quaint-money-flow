// ============================================================================
// TIPOS BASE - Entidades principais
// ============================================================================

export interface Category {
  id?: string
  name: string
  color: string
  type: 'income' | 'expense'
  icon: string
  parentId?: string // Para subcategorias
  createdAt?: number // Timestamp em segundos
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

export interface Entry {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  category?: Category
  accountId?: string // ID da conta relacionada
  creditCardId?: string // ID do cartão de crédito relacionado
  account?: {
    id: string
    name: string
    icon: string
    iconType: string
  }
  creditCard?: {
    id: string
    name: string
    icon: string
    iconType: string
    limit: number
  }
  date: number // Timestamp em segundos
  paid: boolean // Indica se o lançamento foi pago ou não
  createdAt: number // Timestamp em segundos
  updatedAt: number // Timestamp em segundos
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

export interface UserPreferences {
  id?: string
  userId?: string
  entryOrder: 'ascending' | 'descending'
  defaultNavigationPeriod:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
  showDailyBalance: boolean
  viewMode: 'all' | 'cashflow'
  isFinancialSummaryExpanded: boolean
  createdAt?: number // Timestamp em segundos
  updatedAt?: number // Timestamp em segundos
}

export interface BankIcon {
  id: string
  icon: string
  name: string
  logo: string
  searchTerms: string[]
}

// ============================================================================
// TIPOS DE FORMULÁRIO - Para entrada de dados
// ============================================================================

export interface EntryFormData {
  description: string
  amount: string
  type: 'income' | 'expense'
  categoryId: string
  accountId?: string // ID da conta relacionada
  creditCardId?: string // ID do cartão de crédito relacionado
  date: string // String para input de data (será convertida para timestamp)
  paid: boolean // Indica se o lançamento foi pago ou não
}

export interface CategoryFormData {
  name: string
  color: string
  type: 'income' | 'expense'
  icon: string
  parentId?: string // Para subcategorias
}

export interface AccountFormData {
  name: string
  type: 'bank' | 'investment' | 'cash' | 'other'
  icon: string
  iconType: 'bank' | 'generic'
  includeInGeneralBalance: boolean
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

export interface UserPreferencesFormData {
  entryOrder?: 'ascending' | 'descending'
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

// ============================================================================
// TIPOS DE SERVIÇO - Para APIs e queries
// ============================================================================

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SelectOption {
  value: string
  label: string
  icon?: string
  iconType?: string
  color?: string
}

// ============================================================================
// TIPOS DE QUERY - Para parâmetros de busca
// ============================================================================

export interface EntriesQueryParams {
  page?: number
  limit?: number
  type?: 'income' | 'expense'
  categoryId?: string
  accountId?: string
  creditCardId?: string
  startDate?: string
  endDate?: string
  search?: string
  viewMode?: 'cashflow' | 'all'
}

export interface CategoriesQueryParams {
  page?: number
  limit?: number
  type?: 'income' | 'expense'
  search?: string
  parentId?: string
}

export interface AccountsQueryParams {
  page?: number
  limit?: number
  type?: 'bank' | 'investment' | 'cash' | 'other'
  search?: string
}

export interface CreditCardsQueryParams {
  page?: number
  limit?: number
  search?: string
}

// ============================================================================
// TIPOS DE RESPOSTA - Para respostas específicas de APIs
// ============================================================================

export interface EntriesResponse {
  entries: Entry[]
  previousBalance?: number
  summary?: {
    cashflow?: {
      previousBalance: number
      realizedIncome: number
      expectedIncome: number
      realizedExpense: number
      expectedExpense: number
      currentBalance: number
      projectedBalance: number
    }
    all?: {
      income: number
      expense: number
      balance: number
    }
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CategoriesResponse {
  categories: Category[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface AccountsResponse {
  accounts: Account[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreditCardsResponse {
  creditCards: CreditCard[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ============================================================================
// TIPOS ESPECÍFICOS - Para casos de uso específicos
// ============================================================================

export interface CategoryUsage {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense'
  transactionCount: number
  totalAmount: number
}

// ============================================================================
// TIPOS DE OVERVIEW - Para funcionalidade de visão geral
// ============================================================================

export interface PendingAccount {
  id: string
  description: string
  amount: number
  date: number // timestamp em segundos
  categoryName: string
  isOverdue: boolean
}

export interface GeneralOverview {
  monthlyIncome: number
  monthlyExpenses: number
  totalAccountsPayable: number
  totalAccountsReceivable: number
  accountsPayable: PendingAccount[]
  accountsReceivable: PendingAccount[]
  period: {
    year: number
    month: number
  }
}

export interface CategoryExpense {
  id: string
  categoryName: string
  icon: string
  color: string
  totalAmount: number
}

export interface TopExpensesByCategory {
  expenses: CategoryExpense[]
  period: string
  dateRange: {
    startDate: number // Timestamp em segundos
    endDate: number // Timestamp em segundos
  }
  totalExpenses: number
}

export interface QuickStats {
  monthlyBalance: number
  overduePayable: number
  overdueReceivable: number
  totalPendingPayable: number
  totalPendingReceivable: number
}

export interface TopExpensesQueryParams {
  period?:
    | 'current-month'
    | 'last-15-days'
    | 'last-30-days'
    | 'last-3-months'
    | 'last-6-months'
}

// ============================================================================
// TIPOS DE UTILIDADE - Para hooks e componentes
// ============================================================================

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type CrudToastType = 'success' | 'error' | 'warning' | 'info'

export type CrudOperation = 'create' | 'update' | 'delete' | 'save'

export interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
}

export interface UseInfiniteScrollReturn {
  ref: (node: Element | null) => void
  isIntersecting: boolean
}
