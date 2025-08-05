import { z } from 'zod'

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

// Tipo inferido do schema
export type AccountFormSchema = z.infer<typeof accountSchema>
