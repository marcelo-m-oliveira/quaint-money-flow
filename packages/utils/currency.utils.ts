/**
 * Utilitários para formatação e manipulação de valores monetários
 */

/**
 * Formata um valor numérico como moeda brasileira
 */
export function formatCurrency(amount: number | undefined | null): string {
  // Verificar se o valor é válido
  if (amount === null || amount === undefined || isNaN(amount)) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(0)
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

/**
 * Converte uma string de entrada de moeda para número
 */
export function parseCurrencyInput(value: string): number {
  // Remove todos os caracteres que não são dígitos, vírgula ou ponto
  const cleanValue = value.replace(/[^\d,.-]/g, '')

  // Substitui vírgula por ponto para parsing
  const normalizedValue = cleanValue.replace(',', '.')

  return parseFloat(normalizedValue) || 0
}

/**
 * Formata uma string de entrada de moeda para exibição
 */
export function formatCurrencyInput(value: string): string {
  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanValue = value.replace(/[^\d,.-]/g, '')

  // Se está vazio, retorna vazio
  if (!cleanValue) return ''

  // Converte para número e formata
  const numericValue = parseCurrencyInput(cleanValue)

  if (isNaN(numericValue)) return ''

  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
