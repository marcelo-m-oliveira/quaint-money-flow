'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export default function GoogleCompletePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const user = searchParams.get('user')
    const metadata = searchParams.get('metadata')
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    async function run() {
      if (!accessToken || !refreshToken || !user) {
        router.replace('/error?error=invalid_backend_response')
        return
      }

      // Verificar se precisa configurar senha
      if (metadata) {
        try {
          const metadataObj = JSON.parse(metadata)
          console.log('🔍 Metadata do Google OAuth:', metadataObj)

          if (metadataObj.needsPasswordSetup) {
            console.log(
              '⚠️ Usuário precisa configurar senha - redirecionando para setup-password',
            )
            // Redirecionar para página de configuração de senha
            const params = new URLSearchParams()
            params.set('accessToken', accessToken)
            params.set('refreshToken', refreshToken)
            params.set('user', user)
            params.set('callbackUrl', callbackUrl)
            router.replace(`/auth/setup-password?${params.toString()}`)
            return
          } else {
            console.log(
              '✅ Usuário não precisa configurar senha - fazendo login normal',
            )
          }
        } catch (error) {
          console.error('Erro ao parsear metadados:', error)
        }
      } else {
        console.log('ℹ️ Nenhum metadata recebido')
      }

      // Login normal
      await signIn('credentials', {
        accessToken,
        refreshToken,
        user,
        callbackUrl,
        redirect: true,
      })
    }

    // eslint-disable-next-line no-void
    void run()
  }, [searchParams, router])

  return null
}
