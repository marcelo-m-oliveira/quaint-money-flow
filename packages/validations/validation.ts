/**
 * Retorna a mensagem de validação com base no validador aplicado.
 *
 * @param fieldName - Nome do campo que falhou na validação.
 * @param validatorName - Nome da regra de validação que falhou.
 * @param validatorValue - Valor contextual usado na validação.
 * @returns Mensagem de validação personalizada.
 */
export function getValidationMessage(
  fieldName: string,
  validatorName: string,
  validatorValue?: unknown,
): string {
  const validator = validationMessages[validatorName]
  if (typeof validator === 'function') {
    return validator(fieldName, validatorValue)
  }
  return validator as string
}

/**
 * Validador Angular para CPF.
 *
 * @returns Um objeto `{ cpfInvalid: true }` caso o CPF seja inválido, ou `null` se for válido.
 * @param cpf
 */
export function cpfInvalid(cpf: string): { [key: string]: boolean } | null {
  if (!isValidCPF(cpf)) {
    return { cpfInvalid: true }
  }
  return null
}

/**
 * Valida se um CPF é válido (considerando dígitos verificadores).
 *
 * @param cpf - CPF no formato string (aceita com ou sem máscara)
 * @returns Verdadeiro se válido, falso caso seja inválido.
 */
export function isValidCPF(cpf: string): boolean {
  if (!cpf) return false

  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '')

  // Verifica se o CPF tem exatamente 11 dígitos
  if (cpf.length !== 11) return false

  // Verifica se todos os dígitos são iguais (ex: "111.111.111-11")
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Cálculo do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let firstVerifier = (sum * 10) % 11
  if (firstVerifier === 10 || firstVerifier === 11) firstVerifier = 0

  if (firstVerifier !== parseInt(cpf.charAt(9))) return false

  // Cálculo do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  let secondVerifier = (sum * 10) % 11
  if (secondVerifier === 10 || secondVerifier === 11) secondVerifier = 0

  return secondVerifier === parseInt(cpf.charAt(10))
}

/**
 * Validador Angular para checar se um CEP é válido.
 *
 * @returns Um objeto `{ zipcodeInvalid: true }` caso CEP seja inválido, ou `null` se for válido
 * @param zipcode
 */
export function zipcodeInvalid(
  zipcode: string,
): { [key: string]: boolean } | null {
  if (!isValidZipcode(zipcode)) {
    return { zipcodeInvalid: true }
  }
  return null
}

/**
 * Valida se o CEP é válido.
 *
 * @param zipcode - CEP no formato string (pode conter máscara ou não)
 * @returns Verdadeiro se o CEP é válido (8 dígitos numéricos), falso caso contrário
 */
export function isValidZipcode(zipcode: string): boolean {
  const cleanedZipcode = replaceNonDigits(zipcode)
  return /^\d{8}$/.test(cleanedZipcode)
}

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

/**
 * Contém todas as mensagens de validação utilizadas no sistema, centralizando mensagens específicas
 * e parâmetros que podem ser reutilizados e personalizados.
 */
export const validationMessages: Record<
  string,
  string | ((fieldName: string, validatorValue?: unknown) => string)
> = {
  required: (fieldName) => `${fieldName} é obrigatório.`,
  max: (fieldName, validatorValue) =>
    `${fieldName} precisa ter no máximo ${(validatorValue as { max?: number })?.max} dias.`,
  passwordError: () => `As senhas devem ser iguais!`,
  maxlength: (fieldName, validatorValue) =>
    `${fieldName} precisa ter no máximo ${(validatorValue as { requiredLength?: number })?.requiredLength} caracteres.`,
  pattern: () => 'Campo inválido.',
  mask: (fieldName) => `${fieldName} está inválido.`,
  cpfInvalid: () => `CPF inválido.`,
  zipcodeInvalid: () => `CEP inválido.`,
  email: () => `E-mail inválido.`,
  maior1MB: () => 'A imagem não pode ser maior que 1MB!',
  maior20MB: () => 'O corpo do e-mail não pode ser maior que 20MB!',
  urlInvalid: () => `URL inválido.`,
}
