'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/lib'

const signUpSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})
type SignUpSchema = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpSchema>({ resolver: zodResolver(signUpSchema) })

  async function onSubmit(data: SignUpSchema) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await authService.register(data)
      setSuccess('Conta criada com sucesso! Você já pode entrar.')
      reset()
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado')
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
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-3 pt-2">
            <Button className="w-full" disabled={loading} type="submit">
              Criar conta
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
            <ShieldCheck className="h-4 w-4" /> {success}
          </div>
        )}
      </div>
    </div>
  )
}
