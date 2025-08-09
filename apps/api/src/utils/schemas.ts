// Arquivo de exemplo mostrando como importar e usar os schemas existentes
// Este arquivo demonstra a integração com o package @quaint-money/validations

import {
  type AccountCreateSchema,
  accountCreateSchema,
  type AccountFormSchema,
  accountSchema,
  type CategoryFormSchema,
  categorySchema,
  type CreditCardFormSchema,
  creditCardSchema,
  preferencesSchema,
  type TransactionFormSchema,
  transactionSchema,
  type UserPreferencesSchema,
} from '@saas/validations'
// Schemas adicionais específicos da API
import { z } from 'zod'

// Re-exportar schemas para uso nas rotas
export {
  transactionSchema,
  categorySchema,
  accountCreateSchema,
  accountSchema,
  creditCardSchema,
  preferencesSchema,
}

// Schema para criação de cartão de crédito (baseado no creditCardSchema)
export const creditCardCreateSchema = creditCardSchema

// Re-exportar tipos para uso nos handlers
export type {
  TransactionFormSchema,
  CategoryFormSchema,
  AccountCreateSchema,
  AccountFormSchema,
  CreditCardFormSchema,
  UserPreferencesSchema,
}

export type CreditCardCreateSchema = z.infer<typeof creditCardCreateSchema>

// Schema para parâmetros de ID
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
})

// Schema para paginação
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// Schema para filtros de transação
export const transactionFiltersSchema = z
  .object({
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
    creditCardId: z.string().optional(),
    paid: z.coerce.boolean().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: z.string().optional(),
  })
  .merge(paginationSchema)

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email deve ser válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

// Schema para registro
export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email deve ser válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

// Schema para atualização de perfil
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email deve ser válido').optional(),
})

// Schema para alteração de senha
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

// Tipos inferidos dos schemas da API
export type IdParamSchema = z.infer<typeof idParamSchema>
export type PaginationSchema = z.infer<typeof paginationSchema>
export type TransactionFiltersSchema = z.infer<typeof transactionFiltersSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
