import { z } from 'zod'

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
        const num = parseFloat(val.replace(/[^\d,.-]/g, '').replace(',', '.'))
        return !isNaN(num) && num >= 0
      },
      { message: 'Limite deve ser um valor válido' },
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

// Tipo inferido do schema
export type CreditCardFormSchema = z.infer<typeof creditCardSchema>
