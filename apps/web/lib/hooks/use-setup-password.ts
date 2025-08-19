import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { setupPassword } from '@/lib/services/auth'

interface UseSetupPasswordProps {
  accessToken?: string | null
  refreshToken?: string | null
  user?: string | null
  callbackUrl?: string | null
}

export function useSetupPassword({
  accessToken,
  refreshToken,
  user,
  callbackUrl = '/',
}: UseSetupPasswordProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSetupPassword = async (
    password: string,
    confirmPassword: string,
  ) => {
    if (!accessToken || !refreshToken || !user) {
      toast.error('Dados de autenticação inválidos')
      router.replace('/error?error=invalid_auth_data')
      return false
    }

    setIsLoading(true)

    try {
      await setupPassword(password, confirmPassword, accessToken)
      toast.success('Senha configurada com sucesso!')

      // Fazer login com as credenciais
      await signIn('credentials', {
        accessToken,
        refreshToken,
        user,
        callbackUrl,
        redirect: true,
      } as any)

      return true
    } catch (error) {
      console.error('Erro ao configurar senha:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro interno do servidor',
      )
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleSetupPassword,
    isLoading,
  }
}
