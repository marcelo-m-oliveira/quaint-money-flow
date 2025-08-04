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
  date: z.string().min(1, 'Data é obrigatória'),
})

// Tipo inferido do schema
export type TransactionFormSchema = z.infer<typeof transactionSchema>
