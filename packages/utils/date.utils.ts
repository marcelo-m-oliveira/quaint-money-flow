/**
 * Utilitários para manipulação de datas
 */

/**
 * Formata uma data para exibição no padrão brasileiro
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

/**
 * Formata uma data para input HTML (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  // Usar métodos locais para evitar problemas de timezone
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converte uma data para timestamp (início do dia em UTC)
 * Ideal para armazenamento e comparações
 */
export function dateToTimestamp(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  return new Date(year, month, day).getTime()
}

/**
 * Converte um timestamp para Date (início do dia local)
 * Ideal para exibição e manipulação
 */
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp)
}

/**
 * Converte uma string de tempo (HH:MM) para minutos
 * Exemplo: "14:30" -> 870 minutos
 */
export function convertTimeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Converte uma data para segundos desde epoch
 * Padrão para envio de datas entre frontend e backend
 */
export function dateToSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

/**
 * Converte segundos desde epoch para Date
 * Padrão para recebimento de datas do backend
 */
export function secondsToDate(seconds: number): Date {
  return new Date(seconds * 1000)
}

/**
 * Converte uma string de data (YYYY-MM-DD) para timestamp
 * Garante que a data seja interpretada como local, não UTC
 */
export function dateStringToTimestamp(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).getTime()
}

/**
 * Converte um timestamp para string de data (YYYY-MM-DD)
 */
export function timestampToDateString(timestamp: number): string {
  const date = new Date(timestamp)
  return formatDateForInput(date)
}

/**
 * Determina o período do dia com base na hora atual
 * @returns Objeto contendo a saudação e o ícone correspondente
 */
export function getDayPeriod(): { greeting: string; icon: string } {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return { greeting: 'Bom dia', icon: '☀️' } // Manhã: sol
  } else if (hour >= 12 && hour < 18) {
    return { greeting: 'Boa tarde', icon: '🌤️' } // Tarde: sol com nuvem
  } else {
    return { greeting: 'Boa noite', icon: '🌙' } // Noite: lua
  }
}
