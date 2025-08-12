// Arquivo de schemas da API usando a estrutura padronizada
// Este arquivo demonstra a integração com o package @quaint-money/validations

import {
  type AccountBalanceSchema,
  accountBalanceSchema,
  type AccountBaseSchema,
  accountBaseSchema,
  type AccountCreateSchema,
  accountCreateSchema,
  type AccountFiltersSchema,
  accountFiltersSchema,
  type AccountListResponseSchema,
  accountListResponseSchema,
  type AccountResponseSchema,
  accountResponseSchema,
  type AccountUpdateSchema,
  accountUpdateSchema,
  type CategoryBaseSchema,
  categoryBaseSchema,
  type CategoryCreateSchema,
  categoryCreateSchema,
  type CategoryFiltersSchema,
  categoryFiltersSchema,
  type CategoryResponseSchema,
  categoryResponseSchema,
  type CategoryUpdateSchema,
  categoryUpdateSchema,
  type CategoryUsageSchema,
  categoryUsageSchema,
  type ChangePasswordSchema,
  changePasswordSchema,
  type CreditCardBaseSchema,
  creditCardBaseSchema,
  type CreditCardCreateSchema,
  creditCardCreateSchema,
  type CreditCardListResponseSchema,
  creditCardListResponseSchema,
  type CreditCardResponseSchema,
  creditCardResponseSchema,
  type CreditCardUpdateSchema,
  creditCardUpdateSchema,
  type CreditCardUsageSchema,
  creditCardUsageSchema,
  // Tipos
  type EntryBaseSchema,
  // Schemas base
  entryBaseSchema,
  type EntryCreateSchema,
  // Schemas de request
  entryCreateSchema,
  type EntryFiltersSchema,
  entryFiltersSchema,
  type EntryListResponseSchema,
  // Schemas compostos
  entryListResponseSchema,
  type EntryResponseSchema,
  // Schemas de response
  entryResponseSchema,
  type EntryUpdateSchema,
  entryUpdateSchema,
  type IdParamSchema,
  // Schemas de validação
  idParamSchema,
  type LoginSchema,
  // Schemas de autenticação
  loginSchema,
  type PaginationSchema,
  paginationSchema,
  type PreferencesBaseSchema,
  preferencesBaseSchema,
  type PreferencesCreateSchema,
  preferencesCreateSchema,
  type PreferencesResponseSchema,
  preferencesResponseSchema,
  type PreferencesUpdateSchema,
  preferencesUpdateSchema,
  type RegisterSchema,
  registerSchema,
  type SelectOptionSchema,
  selectOptionSchema,
  type UpdateProfileSchema,
  updateProfileSchema,
} from '@saas/validations'
import { z } from 'zod'

// ============================================================================
// RE-EXPORTAÇÃO DOS SCHEMAS PRINCIPAIS
// ============================================================================

// Schemas base
export {
  entryBaseSchema,
  categoryBaseSchema,
  accountBaseSchema,
  creditCardBaseSchema,
  preferencesBaseSchema,
}

// Schemas de request
export {
  entryCreateSchema,
  entryUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  accountCreateSchema,
  accountUpdateSchema,
  creditCardCreateSchema,
  creditCardUpdateSchema,
  preferencesCreateSchema,
  preferencesUpdateSchema,
}

// Schema específico para PATCH - permite atualizações parciais
export const entryPatchSchema = entryUpdateSchema.partial()

// Schemas de response
export {
  entryResponseSchema,
  categoryResponseSchema,
  accountResponseSchema,
  creditCardResponseSchema,
  preferencesResponseSchema,
}

// Schemas compostos
export {
  entryListResponseSchema,
  accountListResponseSchema,
  creditCardListResponseSchema,
  selectOptionSchema,
  categoryUsageSchema,
  accountBalanceSchema,
  creditCardUsageSchema,
}

// Schemas de validação
export {
  idParamSchema,
  paginationSchema,
  entryFiltersSchema,
  categoryFiltersSchema,
  accountFiltersSchema,
}

// Schemas de autenticação
export {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
}

// ============================================================================
// RE-EXPORTAÇÃO DOS TIPOS
// ============================================================================

// Tipos base
export type {
  EntryBaseSchema,
  CategoryBaseSchema,
  AccountBaseSchema,
  CreditCardBaseSchema,
  PreferencesBaseSchema,
}

// Tipos de request
export type {
  EntryCreateSchema,
  EntryUpdateSchema,
  CategoryCreateSchema,
  CategoryUpdateSchema,
  AccountCreateSchema,
  AccountUpdateSchema,
  CreditCardCreateSchema,
  CreditCardUpdateSchema,
  PreferencesCreateSchema,
  PreferencesUpdateSchema,
}

// Tipo específico para PATCH
export type EntryPatchSchema = z.infer<typeof entryPatchSchema>

// Tipos de response
export type {
  EntryResponseSchema,
  CategoryResponseSchema,
  AccountResponseSchema,
  CreditCardResponseSchema,
  PreferencesResponseSchema,
}

// Tipos compostos
export type {
  EntryListResponseSchema,
  AccountListResponseSchema,
  CreditCardListResponseSchema,
  SelectOptionSchema,
  CategoryUsageSchema,
  AccountBalanceSchema,
  CreditCardUsageSchema,
}

// Tipos de validação
export type {
  IdParamSchema,
  PaginationSchema,
  EntryFiltersSchema,
  CategoryFiltersSchema,
  AccountFiltersSchema,
}

// Tipos de autenticação
export type {
  LoginSchema,
  RegisterSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
}

// ============================================================================
// SCHEMAS ESPECÍFICOS DA API (se necessário)
// ============================================================================

// Schema para resposta de erro padrão
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
})

// Schema para resposta de sucesso genérica
export const successResponseSchema = z.object({
  message: z.string(),
  data: z.unknown().optional(),
})

// Schema para resposta de paginação genérica
export const paginationResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
})

// Tipos inferidos dos schemas específicos da API
export type ErrorResponseSchema = z.infer<typeof errorResponseSchema>
export type SuccessResponseSchema = z.infer<typeof successResponseSchema>
export type PaginationResponseSchema = z.infer<typeof paginationResponseSchema>

// ============================================================================
// SCHEMAS ESPECÍFICOS DO OVERVIEW
// ============================================================================

// Schema para conta pendente (a pagar ou a receber)
export const pendingAccountSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number(),
  date: z.number(), // timestamp em segundos
  categoryName: z.string(),
  isOverdue: z.boolean(),
})

// Schema para resumo geral
export const generalOverviewSchema = z.object({
  monthlyIncome: z.number(),
  monthlyExpenses: z.number(),
  totalAccountsPayable: z.number(),
  totalAccountsReceivable: z.number(),
  accountsPayable: z.array(pendingAccountSchema),
  accountsReceivable: z.array(pendingAccountSchema),
  period: z.object({
    year: z.number(),
    month: z.number(),
  }),
})

// Schema para gasto por categoria
export const categoryExpenseSchema = z.object({
  categoryName: z.string(),
  totalAmount: z.number(),
})

// Schema para maiores gastos por categoria
export const topExpensesByCategorySchema = z.object({
  expenses: z.array(categoryExpenseSchema),
  period: z.string(),
  dateRange: z.object({
    startDate: z.number().optional(), // timestamp em segundos
    endDate: z.number().optional(), // timestamp em segundos
  }),
  totalExpenses: z.number(),
})

// Schema para estatísticas rápidas
export const quickStatsSchema = z.object({
  monthlyBalance: z.number(),
  overduePayable: z.number(),
  overdueReceivable: z.number(),
  totalPendingPayable: z.number(),
  totalPendingReceivable: z.number(),
})

// Schema para query de período dos maiores gastos
export const topExpensesQuerySchema = z.object({
  period: z
    .enum([
      'current-month',
      'last-15-days',
      'last-30-days',
      'last-3-months',
      'last-6-months',
    ])
    .optional()
    .default('current-month'),
})

// Tipos inferidos dos schemas do overview
export type PendingAccountSchema = z.infer<typeof pendingAccountSchema>
export type GeneralOverviewSchema = z.infer<typeof generalOverviewSchema>
export type CategoryExpenseSchema = z.infer<typeof categoryExpenseSchema>
export type TopExpensesByCategorySchema = z.infer<
  typeof topExpensesByCategorySchema
>
export type QuickStatsSchema = z.infer<typeof quickStatsSchema>
export type TopExpensesQuerySchema = z.infer<typeof topExpensesQuerySchema>
