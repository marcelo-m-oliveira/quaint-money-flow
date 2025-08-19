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
          if (metadataObj.needsPasswordSetup) {
            // Redirecionar para página de configuração de senha
            const params = new URLSearchParams()
            params.set('accessToken', accessToken)
            params.set('refreshToken', refreshToken)
            params.set('user', user)
            params.set('callbackUrl', callbackUrl)
            router.replace(`/auth/setup-password?${params.toString()}`)
            return
          }
        } catch (error) {
          console.error('Erro ao parsear metadados:', error)
        }
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
