/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 */
export function convertToDate(date: string): Date {
  return new Date(date)
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

// formatDate foi movida para date.utils.ts

/**
 * Formata a data com o horário incluído (DD/MM/YYYY HH:mm:ss)
 */
export function formatDateWithTime(
  date: Date,
  locale: string = 'pt-BR',
): string {
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Retorna a hora e minutos no formato HH:mm
 */
export function getTime(
  date: Date,
  hour12: boolean = false,
  locale: string = 'pt-BR',
): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12, // Usa formato 24 horas
  })
}

// Funções de data foram movidas para date.utils.ts
// truncateText foi movida para format.utils.ts

/**
 * Nomeia um relatório seguindo o formato padrão
 */
export function nameReport(
  rowData: Record<string, unknown>,
  extension: string,
  reportName?: string,
): string {
  const clientName =
    rowData.nomeCliente || rowData.cliente || 'Sem_Nome_Cliente'
  const year = rowData.ano || rowData.anoCalendario || 'Sem_Ano'
  const defaultName = reportName || 'Relatório'
  return `${defaultName}_${clientName}_AC_${year}.${extension}`
}

// Funções movidas para arquivos específicos:
// - nameTemplate -> format.utils.ts
// - nameUrlString -> string.utils.ts
// - replaceCpfCnpj -> string.utils.ts
// - maskCpf -> string.utils.ts

/**
 * Obtém o limite de caracteres com base na largura da tela
 */
export function getCharacterLimit(customLimit: number = 55): number {
  const screenWidth = window.innerWidth
  return Math.floor(screenWidth / customLimit)
}

/**
 * Gera uma cor de fundo para hover baseada no índice
 */
export function generateHoverBackground(
  colors: string[],
  index: number,
): string {
  const baseColor = colors[index % colors.length]
  let r = parseInt(baseColor.slice(1, 3), 16)
  let g = parseInt(baseColor.slice(3, 5), 16)
  let b = parseInt(baseColor.slice(5, 7), 16)
  const variation = index * 1
  r = (r + variation) % 256
  g = (g + variation) % 256
  b = (b + variation) % 256
  return `rgba(${r},${g},${b},0.87)`
}

/**
 * Converte um número em um formato simplificado com sufixos (ex: K, M, B)
 */
export function transformValue(value: number): string {
  const isNegative = value < 0
  value = Math.abs(value)
  let formattedValue: string
  if (value >= 10000) {
    let newValue = value
    let suffix = ''
    if (value >= 1_000_000_000) {
      newValue = value / 1_000_000_000
      suffix = 'B'
    } else if (value >= 1_000_000) {
      newValue = value / 1_000_000
      suffix = 'M'
    } else if (value >= 1_000) {
      newValue = value / 1_000
      suffix = 'K'
    }
    formattedValue = `R$ ${newValue.toFixed(1)} ${suffix}`
  } else {
    formattedValue = transformValueWithoutCurrency(value)
  }
  return isNegative ? `- ${formattedValue}` : formattedValue
}

/**
 * Transforma um número para valores simplificados sem o símbolo da moeda
 */
export function transformValueWithoutCurrency(value: number): string {
  const isNegative = value < 0
  value = Math.abs(value)
  if (value >= 1_000_000_000) {
    return `${Math.floor(value / 1_000_000_000)} bi`
  } else if (value >= 1_000_000) {
    return `${Math.floor(value / 1_000_000)} mi`
  } else if (value >= 1_000) {
    return `${Math.floor(value / 1_000)} mil`
  }
  return isNegative ? `- ${value}` : value.toString()
}

/**
 * Transforma um número grande em formato textual detalhado
 */
export function transformValueVerbose(value: number): string {
  const isNegative = value < 0
  value = Math.abs(value)
  if (value >= 1_000_000_000) {
    const num = Math.floor(value / 1_000_000_000)
    return `${num} ${num === 1 ? 'bilhão' : 'bilhões'}`
  } else if (value >= 1_000_000) {
    const num = Math.floor(value / 1_000_000)
    return `${num} ${num === 1 ? 'milhão' : 'milhões'}`
  } else if (value >= 1_000) {
    return `${Math.floor(value / 1_000)} mil`
  }
  return isNegative ? `- ${value}` : value.toString()
}

// Funções de CPF movidas para string.utils.ts

// maskCnpj e capitalize foram movidas para string.utils.ts
