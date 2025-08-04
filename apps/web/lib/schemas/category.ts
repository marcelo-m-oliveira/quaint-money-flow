import { z } from 'zod'

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

// Tipo inferido do schema
export type CategoryFormSchema = z.infer<typeof categorySchema>
