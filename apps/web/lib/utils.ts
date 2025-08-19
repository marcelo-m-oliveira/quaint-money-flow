// Re-exportação da função movida para o package @saas/utils
export { cn } from '@saas/utils'

// Constrói uma query string a partir de um objeto, ignorando valores undefined/null
// Se options.cacheBust for true, adiciona um parâmetro _t com timestamp para bust de cache
export function buildQuery(
  params?: Record<string, unknown>,
  options?: { cacheBust?: boolean },
): string {
  const searchParams = new URLSearchParams()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      searchParams.append(key, String(value))
    })
  }

  if (options?.cacheBust) {
    searchParams.append('_t', Date.now().toString())
  }

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}
