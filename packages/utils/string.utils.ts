/**
 * Utilitários para manipulação de strings
 */

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
 * Nomeia uma URL string para remover espaços
 */
export function nameUrlString(res: string): string {
  return res.replace(/\s/g, '-')
}

/**
 * Remove todos os caracteres não numéricos de uma string
 * @param value - String a ser limpa
 * @returns String contendo apenas números
 */
export function replaceNonDigits(value: string): string {
  return value.replace(/\D+/g, '')
}

/**
 * Capitaliza a primeira letra de uma string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Converte uma string para slug (URL-friendly)
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}
