export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function parseCurrencyInput(value: string): number {
  // Remove todos os caracteres que não são dígitos, vírgula ou ponto
  const cleanValue = value.replace(/[^\d,.-]/g, '')

  // Substitui vírgula por ponto para parsing
  const normalizedValue = cleanValue.replace(',', '.')

  return parseFloat(normalizedValue) || 0
}

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
