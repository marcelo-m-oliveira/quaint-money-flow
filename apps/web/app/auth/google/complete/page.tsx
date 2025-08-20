'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { useAuth } from '@/lib/hooks/use-auth'

function GoogleCompleteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { googleLogin } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')

    async function run() {
      if (!code) {
        setError('Código de autorização não fornecido')
        return
      }

      try {
        await googleLogin(code)
        // O redirecionamento será feito automaticamente pelo hook useAuth
      } catch (error) {
        console.error('Erro no login com Google:', error)
        setError('Erro na autenticação com Google. Tente novamente.')
        // Redirecionar para página de erro após 3 segundos
        setTimeout(() => {
          router.push('/signin?error=google_auth_failed')
        }, 3000)
      }
    }

    // eslint-disable-next-line no-void
    void run()
  }, [searchParams, router, googleLogin])

  if (error) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-md place-items-center px-4 py-10">
        <div className="w-full space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-destructive">
              Erro na Autenticação
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-md place-items-center px-4 py-10">
      <div className="w-full space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="text-2xl font-bold">Autenticando...</div>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto completamos sua autenticação com o Google.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function GoogleCompletePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <GoogleCompleteForm />
    </Suspense>
  )
}
