'use client'

import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/use-auth'

function GoogleCompleteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { googleLogin } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const code = searchParams.get('code')

    async function run() {
      if (!code) {
        setError('Código de autorização não fornecido')
        setIsLoading(false)
        return
      }

      try {
        await googleLogin(code)
        // O redirecionamento será feito automaticamente pelo hook useAuth
      } catch (error) {
        console.error('Erro no login com Google:', error)
        setError('Erro na autenticação com Google. Tente novamente.')
        setIsLoading(false)
      }
    }

    // eslint-disable-next-line no-void
    void run()
  }, [searchParams, router, googleLogin])

  const handleRetry = () => {
    router.push('/signin')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  if (error) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-md place-items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">
              Falha na Autenticação
            </CardTitle>
            <CardDescription className="text-sm">{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleRetry} className="w-full" variant="outline">
              Tentar Novamente
            </Button>
            <Button onClick={handleGoHome} className="w-full">
              Ir para o Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-md place-items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <CheckCircle className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-xl">
            {isLoading ? 'Autenticando com Google' : 'Autenticação Concluída'}
          </CardTitle>
          <CardDescription className="text-sm">
            {isLoading
              ? 'Aguarde enquanto completamos sua autenticação...'
              : 'Redirecionando para o dashboard...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Google Logo */}
            <div className="flex items-center justify-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium">Conectando com Google</div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  ✓
                </div>
                <span className="text-sm text-muted-foreground">
                  Autorização concedida
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '✓'
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  Validando credenciais
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                  {!isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '2'
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  Redirecionando...
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function GoogleCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-md place-items-center px-4 py-10">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardTitle className="text-xl">Carregando...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <GoogleCompleteForm />
    </Suspense>
  )
}
