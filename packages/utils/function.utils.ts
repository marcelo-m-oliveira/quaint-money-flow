/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 */
export function convertToDate(date: string): Date {
  return new Date(date)
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 */
export function formatDate(date: Date, locale: string = 'pt-BR'): string {
  return date.toLocaleDateString(locale)
}

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

/**
 * Retorna apenas o ano de uma data
 */
export function getYear(date: Date): number {
  return date.getFullYear()
}

/**
 * Retorna apenas o mês de uma data (1-12)
 */
export function getMonth(date: Date): number {
  return date.getMonth() + 1 // Os meses começam de 0, por isso somamos 1
}

/**
 * Retorna apenas o dia do mês de uma data
 */
export function getDay(date: Date): number {
  return date.getDate()
}

/**
 * Retorna apenas a hora de uma data
 */
export function getHours(date: Date): number {
  return date.getHours()
}

/**
 * Retorna apenas os minutos de uma data
 */
export function getMinutes(date: Date): number {
  return date.getMinutes()
}

/**
 * Retorna apenas os segundos de uma data
 */
export function getSeconds(date: Date): number {
  return date.getSeconds()
}

/**
 * Trunca um texto para o tamanho máximo especificado, adicionando reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + '...'
}

/**
 * Nomeia um relatório seguindo o formato padrão
 */
export function nameReport(
  rowData: any,
  extension: string,
  reportName?: string,
): string {
  const clientName =
    rowData.nomeCliente || rowData.cliente || 'Sem_Nome_Cliente'
  const year = rowData.ano || rowData.anoCalendario || 'Sem_Ano'
  const defaultName = reportName || 'Relatório'
  return `${defaultName}_${clientName}_AC_${year}.${extension}`
}

/**
 * Nomeia um template seguindo o formato padrão
 */
export function nameTemplate(rowData: any): string {
  const nameParts = rowData?.nomeTemplate.split('.')
  return `${nameParts[0]}_${rowData.cliente}_AC_${rowData.anoCalendario}.${nameParts[1]}`
}

/**
 * Nomeia uma URL string para remover espaços
 */
export function nameUrlString(res: string): string {
  return res.replace(/\s/g, '-')
}

/**
 * Nomeia TemplateDF seguindo o formato específico
 */
export function nameTemplateDF(rowData: any): string {
  const nameParts = rowData?.nomeTemplate.split('_')
  const extensionParts = rowData?.nomeTemplate.split('.')
  return `${nameParts[0]}_${nameParts[1]}_${nameParts[2]}_${nameParts[3]}_${rowData.cliente}_AC_${rowData.anoCalendario}.${extensionParts[1]}`
}

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

/**
 * Remove todos os caracteres não numéricos de uma string de CPF ou CNPJ
 * @param cpfCnpj - A string de CPF ou CNPJ a ser limpa
 * @returns Uma string contendo apenas números
 */
export function replaceCpfCnpj(cpfCnpj: string): string {
  return cpfCnpj.replace(/[^\d]+/g, '')
}

/**
 * Aplica a máscara de CPF (XXX.XXX.XXX-XX) em uma string numérica
 * @param value - A string de CPF não formatada
 * @returns A string de CPF formatada
 */
export function maskCpf(value: string): string {
  return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4')
}

/**
 * Aplica a máscara de CNPJ (XX.XXX.XXX/XXXX-XX) em uma string numérica
 * @param value - A string de CNPJ não formatada
 * @returns A string de CNPJ formatada
 */
export function maskCnpj(value: string): string {
  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5')
}

/**
 * Aplica a upperCase na primeira lestra do texto.
 * @param value - A string de texto
 * @returns A string de texto com a inicial maiúscula
 */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
