/**
 * Utilitários para gerenciamento de cookies
 */

/**
 * Obtém o valor de um cookie pelo nome
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }

  return null
}

/**
 * Define um cookie
 */
export function setCookie(name: string, value: string, maxAge?: number): void {
  if (typeof window === 'undefined') return

  let cookieString = `${name}=${value}; path=/; SameSite=Strict`

  if (maxAge) {
    cookieString += `; max-age=${maxAge}`
  }

  document.cookie = cookieString
}

/**
 * Remove um cookie
 */
export function removeCookie(name: string): void {
  if (typeof window === 'undefined') return

  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`
}
