'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn, Mail, MoveRight, Shield } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})
type SignInSchema = z.infer<typeof signInSchema>

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({ resolver: zodResolver(signInSchema) })

  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-md place-items-center px-4 py-10">
      <div className="w-full space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Shield className="h-6 w-6 text-primary" />
            Entrar
          </div>
          <p className="text-sm text-muted-foreground">
            Acesse sua conta para gerenciar suas finanças.
          </p>
        </div>

        <form
          className="space-y-3"
          onSubmit={handleSubmit(async (data) => {
            setLoading(true)
            await signIn('credentials', {
              email: data.email,
              password: data.password,
              callbackUrl: '/',
            })
            setLoading(false)
          })}
        >
          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
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
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <Link href="/signup" className="text-primary hover:underline">
              Ainda não tem conta?
            </Link>
            <Link
              href="/recover"
              className="text-muted-foreground hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="space-y-3 pt-2">
            <Button className="w-full" disabled={loading} type="submit">
              <LogIn className="h-4 w-4" /> Entrar
            </Button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => {
                window.location.href = '/api/auth/google'
              }}
            >
              <Mail className="h-4 w-4" /> Entrar com Google
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Novo por aqui?</span>
          <Link
            href="/signup"
            className="inline-flex items-center text-primary hover:underline"
          >
            Criar conta <MoveRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
