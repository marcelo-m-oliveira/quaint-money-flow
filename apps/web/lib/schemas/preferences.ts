import { z } from 'zod'

// Schema para validação das preferências do usuário
export const preferencesSchema = z.object({
  transactionOrder: z.enum(['crescente', 'decrescente'], {
    message: 'Ordenação deve ser crescente ou decrescente',
  }),
  defaultNavigationPeriod: z.enum(['diario', 'semanal', 'mensal'], {
    message: 'Período deve ser diário, semanal ou mensal',
  }),
  showDailyBalance: z.boolean({
    message: 'Exibição do saldo diário deve ser verdadeiro ou falso',
  }),
})

// Tipo inferido do schema
export type PreferencesFormSchema = z.infer<typeof preferencesSchema>
