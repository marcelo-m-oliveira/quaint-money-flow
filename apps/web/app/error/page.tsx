'use client'

import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

const errorMessages = {
  missing_code: 'Código de autorização não encontrado. Tente novamente.',
  google_auth_failed: 'Falha na autenticação com Google. Tente novamente.',
  google_oauth_error: 'Erro no processo de autorização do Google.',
  invalid_backend_response: 'Resposta inválida do servidor. Tente novamente.',
  callback_error: 'Erro durante o processo de login. Tente novamente.',
}

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const errorMessage =
    message ||
    errorMessages[error as keyof typeof errorMessages] ||
    'Erro desconhecido'

  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-md place-items-center px-4 py-10">
      <div className="w-full space-y-6 rounded-xl border bg-card p-6 text-center shadow-sm">
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Erro de Autenticação</h1>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/signin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
