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
  // Tipos
  type TransactionBaseSchema,
  // Schemas base
  transactionBaseSchema,
  type TransactionCreateSchema,
  // Schemas de request
  transactionCreateSchema,
  type TransactionFiltersSchema,
  transactionFiltersSchema,
  type TransactionListResponseSchema,
  // Schemas compostos
  transactionListResponseSchema,
  type TransactionResponseSchema,
  // Schemas de response
  transactionResponseSchema,
  type TransactionUpdateSchema,
  transactionUpdateSchema,
  type UpdateProfileSchema,
  updateProfileSchema,
} from '@saas/validations'
import { z } from 'zod'

// ============================================================================
// RE-EXPORTAÇÃO DOS SCHEMAS PRINCIPAIS
// ============================================================================

// Schemas base
export {
  transactionBaseSchema,
  categoryBaseSchema,
  accountBaseSchema,
  creditCardBaseSchema,
  preferencesBaseSchema,
}

// Schemas de request
export {
  transactionCreateSchema,
  transactionUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  accountCreateSchema,
  accountUpdateSchema,
  creditCardCreateSchema,
  creditCardUpdateSchema,
  preferencesCreateSchema,
  preferencesUpdateSchema,
}

// Schemas de response
export {
  transactionResponseSchema,
  categoryResponseSchema,
  accountResponseSchema,
  creditCardResponseSchema,
  preferencesResponseSchema,
}

// Schemas compostos
export {
  transactionListResponseSchema,
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
  transactionFiltersSchema,
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
  TransactionBaseSchema,
  CategoryBaseSchema,
  AccountBaseSchema,
  CreditCardBaseSchema,
  PreferencesBaseSchema,
}

// Tipos de request
export type {
  TransactionCreateSchema,
  TransactionUpdateSchema,
  CategoryCreateSchema,
  CategoryUpdateSchema,
  AccountCreateSchema,
  AccountUpdateSchema,
  CreditCardCreateSchema,
  CreditCardUpdateSchema,
  PreferencesCreateSchema,
  PreferencesUpdateSchema,
}

// Tipos de response
export type {
  TransactionResponseSchema,
  CategoryResponseSchema,
  AccountResponseSchema,
  CreditCardResponseSchema,
  PreferencesResponseSchema,
}

// Tipos compostos
export type {
  TransactionListResponseSchema,
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
  TransactionFiltersSchema,
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
