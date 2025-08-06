import { z } from 'zod'

// Schema para validação de transações
export const transactionSchema = z.object({
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
        return !isNaN(numericValue) && numericValue > 0
      },
      { message: 'Valor deve ser um número positivo' },
    ),
  type: z.enum(['income', 'expense'], {
    message: 'Tipo deve ser receita ou despesa',
  }),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  accountId: z.string().optional(), // ID da conta relacionada (opcional)
  creditCardId: z.string().optional(), // ID do cartão de crédito relacionado (opcional)
  date: z.string().min(1, 'Data é obrigatória'),
  paid: z.boolean(), // Indica se o lançamento foi pago ou não
})

// Schema para validação de categorias
export const categorySchema = z.object({
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
  parentId: z.string().optional(),
})

// Schema para validação de contas
export const accountSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  type: z.enum(['bank', 'credit_card', 'investment', 'cash', 'other'], {
    message: 'Tipo de conta inválido',
  }),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  iconType: z.enum(['bank', 'generic'], {
    message: 'Tipo de ícone inválido',
  }),
  includeInGeneralBalance: z.boolean(),
})

// Schema para validação de cartões de crédito
export const creditCardSchema = z.object({
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
  defaultPaymentAccountId: z.string().optional(),
})

// Schema para validação de preferências do usuário
export const preferencesSchema = z.object({
  transactionOrder: z
    .enum(['crescente', 'decrescente'])
    .optional()
    .default('decrescente'),
  defaultNavigationPeriod: z
    .enum(['diario', 'semanal', 'mensal', 'trimestral', 'anual'])
    .optional()
    .default('mensal'),
  showDailyBalance: z.boolean().optional().default(false),
  viewMode: z.enum(['all', 'cashflow']).optional().default('all'),
  isFinancialSummaryExpanded: z.boolean().optional().default(false),
})

// Tipos inferidos dos schemas
export type TransactionFormSchema = z.infer<typeof transactionSchema>
export type CategoryFormSchema = z.infer<typeof categorySchema>
export type AccountFormSchema = z.infer<typeof accountSchema>
export type CreditCardFormSchema = z.infer<typeof creditCardSchema>
export type UserPreferencesSchema = z.infer<typeof preferencesSchema>
export type PreferencesFormSchema = z.infer<typeof preferencesSchema>
