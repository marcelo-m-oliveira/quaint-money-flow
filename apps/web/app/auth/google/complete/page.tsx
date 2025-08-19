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
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    async function run() {
      if (!accessToken || !refreshToken || !user) {
        router.replace('/error?error=invalid_backend_response')
        return
      }
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
