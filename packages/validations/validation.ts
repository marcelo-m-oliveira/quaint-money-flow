/**
 * Verifica se um valor é considerado vazio.
 *
 * @param value - Valor a ser verificado
 * @returns `true` se o valor for valido. Caso contrário, `false`.
 */
export function isNonEmptyValue(value: unknown): boolean {
  return !!value
}

/**
 * Verifica se um value é inválido (nulo ou sem conteúdo).
 *
 * @param value - Valor a ser verificado
 * @returns `true` se o value for valido, `0` ou `false`. Caso contrário, `false`.
 */
export function isNonNullValue(value: unknown): boolean {
  return Boolean(value) || value === 0 || value === false
}

/**
 * Verifica se um objeto não é considerado vazio.
 *
 * Um objeto é vazio se:
 * - Todas as propriedades forem `null`, `undefined`, ou `''`.
 * - Arrays dentro das propriedades são vazios ou possuem elementos considerados vazios.
 *
 * @param obj - Objeto a ser validado
 * @returns `true` se o objeto tiver alguma propriedade válida. Caso contrário, `false`.
 */
export function isNonEmptyObject(obj: Record<string, unknown>): boolean {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (isNonNullValue(value)) {
        if (Array.isArray(value)) {
          if (value.some((item) => isNonNullValue(item))) {
            return true
          }
        } else {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Verifica se um array é vazio.
 *
 * @param arr - Array a ser validado.
 * @returns `true` se o array for vazio ou `undefined`. Caso contrário, `false`.
 */
export function isNonEmptyArray(arr: unknown[]): boolean {
  return !!arr?.length
}

/**
 * Remove itens duplicados de um array.
 *
 * Usa o `JSON.stringify` para comparar os itens.
 * Pode processar valores complexos, como objetos.
 *
 * @param array - Array com possíveis duplicados
 * @returns Um array novo sem elementos duplicados
 */
export function removeDuplicateItems<T>(array: T[]): T[] {
  return [
    ...new Map(array.map((item) => [JSON.stringify(item), item])).values(),
  ]
}

/**
 * Verifica se todos os campos de um objeto são válidos, e não possuem valor "vazio" ou `0`.
 *
 * @param fields - Objeto contendo os campos a serem validados
 * @returns `true` se todos os campos forem válidos. Caso contrário, `false`.
 */
export function areFieldsNonEmptyOrNonZero(fields: {
  [field: string]: unknown
}): boolean {
  for (const field in fields) {
    if (isNonEmptyValue(fields[field]) || fields[field] === 0) {
      return false
    }
  }
  return true
}

/**
 * Verifica se todos os campos de um objeto não possuem valores nulos, `undefined` ou vazios (`''`).
 *
 * @param fields - Objeto com os campos a serem validados
 * @returns `true` se todos os campos forem válidos. Caso contrário, `false`.
 */
export function areFieldsNonEmpty(fields: {
  [field: string]: unknown
}): boolean {
  for (const field in fields) {
    if (isNonNullValue(fields[field])) {
      return true
    }
  }
  return false
}

/**
 * Remove todos os caracteres não numéricos de uma string.
 *
 * @param value - String a ser limpa
 * @returns String contendo apenas números
 */
export function replaceNonDigits(value: string): string {
  return value.replace(/\D+/g, '')
}
