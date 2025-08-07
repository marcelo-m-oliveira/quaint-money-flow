/**
 * Utilitários para manipulação de datas e períodos
 */

// Tipo para os períodos disponíveis
export type PeriodType =
  | 'diario'
  | 'semanal'
  | 'mensal'
  | 'trimestral'
  | 'anual'

// Funções auxiliares para cálculo de períodos
function getStartOfWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfWeek(date: Date): Date {
  const end = new Date(date)
  const day = end.getDay()
  const diff = end.getDate() + (6 - day)
  end.setDate(diff)
  end.setHours(23, 59, 59, 999)
  return end
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function getStartOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfDay(date: Date): Date {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

// Formatadores de título para cada período
export const PERIOD_TITLE_FORMATTERS = {
  diario: (currentDate: Date = new Date()) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return currentDate.toLocaleDateString('pt-BR', options)
  },
  semanal: (
    startDate?: Date,
    endDate?: Date,
    currentDate: Date = new Date(),
  ) => {
    const start = startDate || getStartOfWeek(currentDate)
    const end = endDate || getEndOfWeek(currentDate)
    return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`
  },
  mensal: (currentDate: Date = new Date()) => {
    return currentDate.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    })
  },
  trimestral: (currentDate: Date = new Date()) => {
    const quarter = Math.floor(currentDate.getMonth() / 3) + 1
    return `${quarter}º Trimestre de ${currentDate.getFullYear()}`
  },
  anual: (currentDate: Date = new Date()) => {
    return currentDate.getFullYear().toString()
  },
} as const

// Funções para obter ranges de período
export const PERIOD_RANGE_FUNCTIONS = {
  diario: (currentDate: Date) => ({
    start: getStartOfDay(currentDate),
    end: getEndOfDay(currentDate),
  }),
  semanal: (currentDate: Date) => ({
    start: getStartOfWeek(currentDate),
    end: getEndOfWeek(currentDate),
  }),
  mensal: (currentDate: Date) => ({
    start: getStartOfMonth(currentDate),
    end: getEndOfMonth(currentDate),
  }),
  trimestral: (currentDate: Date) => {
    const quarterStart = new Date(
      currentDate.getFullYear(),
      Math.floor(currentDate.getMonth() / 3) * 3,
      1,
    )
    const quarterEnd = new Date(
      currentDate.getFullYear(),
      Math.floor(currentDate.getMonth() / 3) * 3 + 3,
      0,
      23,
      59,
      59,
      999,
    )
    return {
      start: quarterStart,
      end: quarterEnd,
    }
  },
  anual: (currentDate: Date) => ({
    start: new Date(currentDate.getFullYear(), 0, 1),
    end: new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999),
  }),
} as const

// Exportar funções auxiliares
export {
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfDay,
  getEndOfDay,
}
