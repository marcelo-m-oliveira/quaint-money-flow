'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, ShieldCheck, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/hooks/use-auth'
import { authService } from '@/lib/services/auth'

const signUpSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .refine((val) => /[a-z]/.test(val), 'A senha deve conter letra minúscula')
    .refine((val) => /[A-Z]/.test(val), 'A senha deve conter letra maiúscula')
    .refine((val) => /\d/.test(val), 'A senha deve conter número')
    .refine(
      (val) => /[^\w\s]/.test(val),
      'A senha deve conter caractere especial',
    ),
})
type SignUpSchema = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null,
  )
  const { register: registerUser, googleLoginPopup } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpSchema>({ resolver: zodResolver(signUpSchema) })

  // Efeito para redirecionamento automático após sucesso
  useEffect(() => {
    if (success && redirectCountdown !== null) {
      const timer = setTimeout(() => {
        if (redirectCountdown > 1) {
          setRedirectCountdown(redirectCountdown - 1)
        } else {
          router.push('/')
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [success, redirectCountdown, router])

  async function onSubmit(data: SignUpSchema) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setRedirectCountdown(null)
    try {
      await registerUser(data)
      setSuccess('Conta criada com sucesso! Você já pode entrar.')
      setRedirectCountdown(5) // Iniciar countdown de 5 segundos
      reset()
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setLoading(true)
      setError(null)

      const authResponse = await authService.openGoogleAuthPopup()

      // Se chegou aqui, a autenticação foi bem-sucedida
      // Usar a nova função do hook para atualizar o contexto
      await googleLoginPopup(authResponse)
    } catch (error) {
      console.error('Erro ao fazer signup com Google:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Erro ao conectar com Google. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-md place-items-center px-4 py-10">
      <div className="w-full space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <UserPlus className="h-6 w-6 text-primary" />
            Criar conta
          </div>
          <p className="text-sm text-muted-foreground">
            Comece gratuitamente. Você poderá personalizar tudo depois.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-sm">Nome</label>
            <Input placeholder="Seu nome" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm">Senha</label>
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
          <div className="space-y-3 pt-2">
            <Button className="w-full" disabled={loading} type="submit">
              Criar conta
            </Button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={handleGoogleSignup}
            >
              <Mail className="h-4 w-4" /> Criar conta com Google
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Já tem conta?</span>
              <Link href="/signin" className="text-primary hover:underline">
                Entrar
              </Link>
            </div>
          </div>
        </form>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-500/10 p-2 text-sm text-emerald-500">
            <ShieldCheck className="h-4 w-4" />
            <div className="flex-1">
              <div>{success}</div>
              {redirectCountdown !== null && (
                <div className="text-xs text-emerald-600">
                  Redirecionando em {redirectCountdown} segundo
                  {redirectCountdown !== 1 ? 's' : ''}...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
