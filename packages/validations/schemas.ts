import { z } from 'zod'

// ============================================================================
// SCHEMAS BASE (entidades principais sem campos de sistema)
// ============================================================================

// Schema base para transações
export const entryBaseSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine(
      (val) => {
        const numericValue = parseFloat(val.replace(',', '.'))
        return !isNaN(numericValue) && numericValue >= 0
      },
      { message: 'Valor deve ser um número válido' },
    ),
  type: z.enum(['income', 'expense'], {
    message: 'Tipo deve ser receita ou despesa',
  }),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  accountId: z.string().optional(), // ID da conta relacionada (opcional)
  creditCardId: z.string().optional(), // ID do cartão de crédito relacionado (opcional)
  date: z.number().min(1, 'Data é obrigatória'),
  paid: z.boolean(), // Indica se o lançamento foi pago ou não
})

// Schema base para categorias
export const categoryBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  color: z
    .string()
    .min(1, 'Cor é obrigatória')
    .regex(
      /^#[0-9A-F]{6}$/i,
      'Cor deve estar no formato hexadecimal (#RRGGBB)',
    ),
  type: z.enum(['income', 'expense'], {
    message: 'Tipo deve ser receita ou despesa',
  }),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  parentId: z.string().optional(),
})

// Schema base para contas
export const accountBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  type: z.enum(['bank', 'investment', 'cash', 'other'], {
    message: 'Tipo de conta inválido',
  }),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  iconType: z.enum(['bank', 'generic'], {
    message: 'Tipo de ícone inválido',
  }),
  includeInGeneralBalance: z.boolean(),
})

// Schema base para cartões de crédito
export const creditCardBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  iconType: z.enum(['bank', 'generic'], {
    message: 'Tipo de ícone inválido',
  }),
  limit: z
    .string()
    .min(1, 'Limite é obrigatório')
    .refine(
      (val) => {
        const numericValue = parseFloat(val.replace(',', '.'))
        return !isNaN(numericValue) && numericValue > 0
      },
      { message: 'Limite deve ser um número positivo' },
    ),
  closingDay: z
    .number()
    .min(1, 'Dia de fechamento deve ser entre 1 e 31')
    .max(31, 'Dia de fechamento deve ser entre 1 e 31'),
  dueDay: z
    .number()
    .min(1, 'Dia de vencimento deve ser entre 1 e 31')
    .max(31, 'Dia de vencimento deve ser entre 1 e 31'),
  defaultPaymentAccountId: z.string().nullish(),
})

// Schema base para preferências do usuário (sem valores padrão)
export const preferencesStrictBaseSchema = z.object({
  entryOrder: z.enum(['ascending', 'descending']),
  defaultNavigationPeriod: z.enum([
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly',
  ]),
  showDailyBalance: z.boolean(),
  viewMode: z.enum(['all', 'cashflow']),
  isFinancialSummaryExpanded: z.boolean(),
})

// Schema base para preferências do usuário (com valores padrão)
export const preferencesBaseSchema = z.object({
  entryOrder: z
    .enum(['ascending', 'descending'])
    .optional()
    .default('descending'),
  defaultNavigationPeriod: z
    .enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
    .optional()
    .default('monthly'),
  showDailyBalance: z.boolean().optional().default(false),
  viewMode: z.enum(['all', 'cashflow']).optional().default('all'),
  isFinancialSummaryExpanded: z.boolean().optional().default(false),
})

// ============================================================================
// SCHEMAS DE REQUEST (para criação e atualização)
// ============================================================================

// Schema para criação de transações
export const entryCreateSchema = entryBaseSchema

// Schema para atualização de transações
export const entryUpdateSchema = entryBaseSchema.partial()

// Schema para criação de categorias
export const categoryCreateSchema = categoryBaseSchema

// Schema para atualização de categorias
export const categoryUpdateSchema = categoryBaseSchema.partial()

// Schema para criação de contas
export const accountCreateSchema = accountBaseSchema

// Schema para atualização de contas
export const accountUpdateSchema = accountBaseSchema.partial()

// Schema para criação de cartões de crédito
export const creditCardCreateSchema = creditCardBaseSchema

// Schema para atualização de cartões de crédito
export const creditCardUpdateSchema = creditCardBaseSchema.partial()

// Schema para criação/atualização de preferências
export const preferencesCreateSchema = preferencesBaseSchema
export const preferencesUpdateSchema = preferencesStrictBaseSchema.partial()

// ============================================================================
// SCHEMAS DE RESPONSE (com campos de sistema e relacionamentos)
// ============================================================================

// Schema para resposta de transações
export const entryResponseSchema = entryBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.number(), // timestamp em segundos
  updatedAt: z.number(), // timestamp em segundos
  category: z
    .object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
      icon: z.string(),
      type: z.enum(['income', 'expense']),
    })
    .optional(),
  account: z
    .object({
      id: z.string(),
      name: z.string(),
      icon: z.string(),
      iconType: z.string(),
    })
    .optional(),
  creditCard: z
    .object({
      id: z.string(),
      name: z.string(),
      icon: z.string(),
    })
    .optional(),
})

// Schema para resposta de categorias
export const categoryResponseSchema = categoryBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  parentId: z.string().nullable(),
  parent: z
    .object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
      icon: z.string(),
    })
    .optional()
    .nullable(),
  children: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        icon: z.string(),
      }),
    )
    .optional(),
})

// Schema para resposta de contas
export const accountResponseSchema = accountBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  balance: z.number().optional(),
})

// Schema para resposta de cartões de crédito
export const creditCardResponseSchema = creditCardBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  limit: z.number(),
  usage: z.number(),
  defaultPaymentAccount: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional()
    .nullable(),
})

// Schema para resposta de preferências
export const preferencesResponseSchema = preferencesBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

// ============================================================================
// SCHEMAS COMPOSTOS E ESPECIAIS
// ============================================================================

// Schema para listagem paginada de transações
export const entryListResponseSchema = z.object({
  entries: z.array(entryResponseSchema),
  previousBalance: z.number().optional(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
})

// Schema para listagem paginada de contas
export const accountListResponseSchema = z.object({
  accounts: z.array(accountResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
})

// Schema para listagem paginada de cartões de crédito
export const creditCardListResponseSchema = z.object({
  creditCards: z.array(creditCardResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
})

// Schema para opções de select
export const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  icon: z.string(),
  iconType: z.string(),
  color: z.string().optional(),
  parentId: z.string().optional(),
})

// Schema para estatísticas de uso de categorias
export const categoryUsageSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  type: z.enum(['income', 'expense']),
  entryCount: z.number(),
  totalAmount: z.number(),
})

// Schema para saldo de conta
export const accountBalanceSchema = z.object({
  balance: z.number(),
  accountId: z.string(),
  lastUpdated: z.string(),
})

// Schema para uso de cartão de crédito
export const creditCardUsageSchema = z.object({
  usage: z.number(),
  limit: z.number(),
  availableLimit: z.number(),
  creditCardId: z.string(),
  lastUpdated: z.string(),
})

// ============================================================================
// SCHEMAS DE VALIDAÇÃO DE PARÂMETROS
// ============================================================================

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
export const entryFiltersSchema = z
  .object({
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
    creditCardId: z.string().optional(),
    paid: z.coerce.boolean().optional(),
    startDate: z
      .union([z.string().datetime(), z.string().regex(/^\d+$/)])
      .optional(),
    endDate: z
      .union([z.string().datetime(), z.string().regex(/^\d+$/)])
      .optional(),
    search: z.string().optional(),
  })
  .merge(paginationSchema)

// Schema para filtros de categoria
export const categoryFiltersSchema = z
  .object({
    search: z.string().optional(),
    type: z.enum(['income', 'expense']).optional(),
    parentId: z.string().optional(),
  })
  .merge(paginationSchema)

// Schema para filtros de conta
export const accountFiltersSchema = z
  .object({
    type: z.enum(['bank', 'investment', 'cash', 'other']).optional(),
    includeInGeneralBalance: z.boolean().optional(),
  })
  .merge(paginationSchema)

// ============================================================================
// SCHEMAS DE AUTENTICAÇÃO
// ============================================================================

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

// ============================================================================
// TIPOS INFERIDOS DOS SCHEMAS
// ============================================================================

// Tipos base
export type EntryBaseSchema = z.infer<typeof entryBaseSchema>
export type CategoryBaseSchema = z.infer<typeof categoryBaseSchema>
export type AccountBaseSchema = z.infer<typeof accountBaseSchema>
export type CreditCardBaseSchema = z.infer<typeof creditCardBaseSchema>
export type PreferencesStrictBaseSchema = z.infer<
  typeof preferencesStrictBaseSchema
>
export type PreferencesBaseSchema = z.infer<typeof preferencesBaseSchema>

// Tipos de request
export type EntryCreateSchema = z.infer<typeof entryCreateSchema>
export type EntryUpdateSchema = z.infer<typeof entryUpdateSchema>
export type CategoryCreateSchema = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateSchema = z.infer<typeof categoryUpdateSchema>
export type AccountCreateSchema = z.infer<typeof accountCreateSchema>
export type AccountUpdateSchema = z.infer<typeof accountUpdateSchema>
export type CreditCardCreateSchema = z.infer<typeof creditCardCreateSchema>
export type CreditCardUpdateSchema = z.infer<typeof creditCardUpdateSchema>
export type PreferencesCreateSchema = z.infer<typeof preferencesCreateSchema>
export type PreferencesUpdateSchema = z.infer<typeof preferencesUpdateSchema>

// Tipos de response
export type EntryResponseSchema = z.infer<typeof entryResponseSchema>
export type CategoryResponseSchema = z.infer<typeof categoryResponseSchema>
export type AccountResponseSchema = z.infer<typeof accountResponseSchema>
export type CreditCardResponseSchema = z.infer<typeof creditCardResponseSchema>
export type PreferencesResponseSchema = z.infer<
  typeof preferencesResponseSchema
>

// Tipos compostos
export type EntryListResponseSchema = z.infer<typeof entryListResponseSchema>
export type AccountListResponseSchema = z.infer<
  typeof accountListResponseSchema
>
export type CreditCardListResponseSchema = z.infer<
  typeof creditCardListResponseSchema
>
export type SelectOptionSchema = z.infer<typeof selectOptionSchema>
export type CategoryUsageSchema = z.infer<typeof categoryUsageSchema>
export type AccountBalanceSchema = z.infer<typeof accountBalanceSchema>
export type CreditCardUsageSchema = z.infer<typeof creditCardUsageSchema>

// Tipos de validação
export type IdParamSchema = z.infer<typeof idParamSchema>
export type PaginationSchema = z.infer<typeof paginationSchema>
export type EntryFiltersSchema = z.infer<typeof entryFiltersSchema>
export type CategoryFiltersSchema = z.infer<typeof categoryFiltersSchema>
export type AccountFiltersSchema = z.infer<typeof accountFiltersSchema>

// Tipos de autenticação
export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>

// ============================================================================
// ALIASES PARA COMPATIBILIDADE (DEPRECATED - REMOVER EM VERSÕES FUTURAS)
// ============================================================================

// @deprecated - Use entryCreateSchema instead
export const entrySchema = entryCreateSchema
// @deprecated - Use categoryCreateSchema instead
export const categorySchema = categoryCreateSchema
// @deprecated - Use accountCreateSchema instead
export const accountSchema = accountCreateSchema
// @deprecated - Use creditCardCreateSchema instead
export const creditCardSchema = creditCardCreateSchema
// @deprecated - Use preferencesCreateSchema instead
export const preferencesSchema = preferencesCreateSchema

// @deprecated - Use EntryCreateSchema instead
export type EntryFormSchema = EntryCreateSchema
// @deprecated - Use CategoryCreateSchema instead
export type CategoryFormSchema = CategoryCreateSchema
// @deprecated - Use AccountCreateSchema instead
export type AccountFormSchema = AccountCreateSchema
// @deprecated - Use CreditCardCreateSchema instead
export type CreditCardFormSchema = CreditCardCreateSchema
// @deprecated - Use PreferencesCreateSchema instead
export type UserPreferencesSchema = PreferencesCreateSchema
export type PreferencesFormSchema = PreferencesCreateSchema
