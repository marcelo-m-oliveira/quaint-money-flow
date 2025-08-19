'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, Shield } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSetupPassword } from '@/lib/hooks/use-setup-password'

const setupPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial',
      ),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

type SetupPasswordForm = z.infer<typeof setupPasswordSchema>

export default function SetupPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const searchParams = useSearchParams()

  const accessToken = searchParams.get('accessToken')
  const refreshToken = searchParams.get('refreshToken')
  const user = searchParams.get('user')
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const { handleSetupPassword, isLoading } = useSetupPassword({
    accessToken,
    refreshToken,
    user,
    callbackUrl,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SetupPasswordForm>({
    resolver: zodResolver(setupPasswordSchema),
  })

  const onSubmit = async (data: SetupPasswordForm) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Senhas não coincidem' })
      return
    }

    await handleSetupPassword(data.password, data.confirmPassword)
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-md place-items-center px-4 py-10">
      <div className="w-full space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Shield className="h-6 w-6 text-primary" />
            Configurar Senha
          </div>
          <p className="text-sm text-muted-foreground">
            Configure uma senha para sua conta e tenha acesso completo ao
            sistema.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-sm">Nova Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Mostrar/ocultar senha"
                title="Mostrar/ocultar senha"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                Senha inválida (mín. 8, com maiúscula, minúscula, número e
                símbolo)
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm">Confirmar Senha</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Mostrar/ocultar senha"
                title="Mostrar/ocultar senha"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="rounded-md border border-blue-200/30 p-3 text-sm">
            <p className="font-medium text-orange-900 dark:text-orange-100">
              Requisitos da senha:
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-orange-900 dark:text-orange-300">
              <li>• Mínimo 8 caracteres</li>
              <li>• Pelo menos uma letra minúscula</li>
              <li>• Pelo menos uma letra maiúscula</li>
              <li>• Pelo menos um número</li>
              <li>• Pelo menos um caractere especial (@$!%*?&)</li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Configurando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Configurar Senha
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
