/**
 * Utilitários para manipulação de datas e períodos
 */

// Tipo para os períodos disponíveis
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

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
  daily: (currentDate: Date = new Date()) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return currentDate.toLocaleDateString('pt-BR', options)
  },
  weekly: (
    startDate?: Date,
    endDate?: Date,
    currentDate: Date = new Date(),
  ) => {
    const start = startDate || getStartOfWeek(currentDate)
    const end = endDate || getEndOfWeek(currentDate)
    return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`
  },
  monthly: (currentDate: Date = new Date()) => {
    return currentDate.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    })
  },
  quarterly: (currentDate: Date = new Date()) => {
    const quarter = Math.floor(currentDate.getMonth() / 3) + 1
    return `${quarter}º Trimestre de ${currentDate.getFullYear()}`
  },
  yearly: (currentDate: Date = new Date()) => {
    return currentDate.getFullYear().toString()
  },
} as const

// Funções para obter ranges de período
export const PERIOD_RANGE_FUNCTIONS = {
  daily: (currentDate: Date = new Date()) => {
    const startOfDay = new Date(currentDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(currentDate)
    endOfDay.setHours(23, 59, 59, 999)
    return { startDate: startOfDay, endDate: endOfDay }
  },
  weekly: (
    currentDate: Date = new Date(),
    startOfWeek: number = 0, // 0 = domingo, 1 = segunda
  ) => {
    const startOfWeek_ = new Date(currentDate)
    const day = startOfWeek_.getDay()
    const diff = startOfWeek_.getDate() - day + startOfWeek
    startOfWeek_.setDate(diff)
    startOfWeek_.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek_)
    endOfWeek.setDate(startOfWeek_.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    return { startDate: startOfWeek_, endDate: endOfWeek }
  },
  monthly: (currentDate: Date = new Date()) => {
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    )
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    )
    return { startDate: startOfMonth, endDate: endOfMonth }
  },
  quarterly: (currentDate: Date = new Date()) => {
    const quarter = Math.floor(currentDate.getMonth() / 3)
    const startOfQuarter = new Date(currentDate.getFullYear(), quarter * 3, 1)
    const endOfQuarter = new Date(
      currentDate.getFullYear(),
      quarter * 3 + 3,
      0,
      23,
      59,
      59,
      999,
    )
    return { startDate: startOfQuarter, endDate: endOfQuarter }
  },
  yearly: (currentDate: Date = new Date()) => {
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1)
    const endOfYear = new Date(
      currentDate.getFullYear(),
      11,
      31,
      23,
      59,
      59,
      999,
    )
    return { startDate: startOfYear, endDate: endOfYear }
  },
}

// Exportar funções auxiliares
export {
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfDay,
  getEndOfDay,
}
