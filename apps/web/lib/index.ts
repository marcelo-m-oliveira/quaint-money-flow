// ============================================================================
// EXPORTAÇÕES CENTRALIZADAS - TIPOS
// ============================================================================

// Tipos base
export type {
  Category,
  Entry,
  Account,
  CreditCard,
  UserPreferences,
  BankIcon,
} from './types'

// Tipos de formulário
export type {
  EntryFormData,
  CategoryFormData,
  AccountFormData,
  CreditCardFormData,
  UserPreferencesFormData,
} from './types'

// Tipos de serviço
export type { ApiResponse, PaginatedResponse, SelectOption } from './types'

// Tipos de query
export type {
  EntriesQueryParams,
  CategoriesQueryParams,
  AccountsQueryParams,
  CreditCardsQueryParams,
} from './types'

// Tipos de resposta
export type {
  EntriesResponse,
  CategoriesResponse,
  AccountsResponse,
  CreditCardsResponse,
} from './types'

// Tipos específicos
export type {
  CategoryUsage,
  PeriodType,
  CrudToastType,
  CrudOperation,
  UseInfiniteScrollOptions,
  UseInfiniteScrollReturn,
} from './types'

// Tipos de overview
export type {
  PendingAccount,
  GeneralOverview,
  CategoryExpense,
  TopExpensesByCategory,
  QuickStats,
  TopExpensesQueryParams,
} from './types'

// ============================================================================
// EXPORTAÇÕES CENTRALIZADAS - SERVIÇOS
// ============================================================================

export { apiClient } from './api'
export { categoriesService } from './services/categories'
export { entriesService } from './services/entries'
export { accountsService } from './services/accounts'
export { creditCardsService } from './services/credit-cards'
export { userPreferencesService } from './services/user-preferences'
export { overviewService } from './services/overview'
export { authService } from './services/auth'

// ============================================================================
// EXPORTAÇÕES CENTRALIZADAS - HOOKS
// ============================================================================

export { useUserPreferencesWithAutoInit } from './hooks/use-user-preferences'
export { useInfiniteScroll } from './hooks/use-infinite-scroll'
export { useCrudToast } from './hooks/use-crud-toast'
export { useSession, signIn, signOut, getCsrfToken } from './hooks/use-session'

// ============================================================================
// EXPORTAÇÕES CENTRALIZADAS - UTILITÁRIOS
// ============================================================================

export { ICON_MAP, getIconComponent } from './icon-map'
export { CategoryIcon } from './components/category-icon'
export * from './date-utils'
export * from './format'
export * from './utils'
