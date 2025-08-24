'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [message, setMessage] = useState('Processando autenticação...')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage('Erro na autenticação com Google')

      // Enviar mensagem de erro para a janela pai
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_ERROR', error },
          window.location.origin,
        )
      }
      return
    }

    if (!code) {
      setStatus('error')
      setMessage('Código de autorização não encontrado')

      // Enviar mensagem de erro para a janela pai
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: 'Código de autorização não encontrado',
          },
          window.location.origin,
        )
      }
      return
    }

    // Enviar código de sucesso para a janela pai
    if (window.opener) {
      setStatus('success')
      setMessage('Autenticação realizada com sucesso!')

      window.opener.postMessage(
        { type: 'GOOGLE_AUTH_SUCCESS', code },
        window.location.origin,
      )

      // Fechar a popup após um breve delay
      setTimeout(() => {
        window.close()
      }, 1000)
    } else {
      // Se não há janela pai, redirecionar para a página principal
      setStatus('success')
      setMessage('Redirecionando...')

      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 p-8 text-center">
        <div className="mx-auto h-16 w-16">
          {status === 'loading' && (
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          )}
          {status === 'success' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold">
          {status === 'loading' && 'Autenticando...'}
          {status === 'success' && 'Sucesso!'}
          {status === 'error' && 'Erro'}
        </h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
