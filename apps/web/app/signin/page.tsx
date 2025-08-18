'use client'

import { LogIn, Mail, MoveRight, Shield, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Senha</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <Link href="/signup" className="text-primary hover:underline">
              Ainda não tem conta?
            </Link>
            <Link href="/recover" className="text-muted-foreground hover:underline">
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              await signIn('credentials', { email, password, callbackUrl: '/' })
              setLoading(false)
            }}
          >
            <LogIn className="h-4 w-4" /> Entrar
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = '/api/auth/google'
            }}
          >
            <Mail className="h-4 w-4" /> Entrar com Google
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Novo por aqui?</span>
          <Link href="/signup" className="inline-flex items-center text-primary hover:underline">
            Criar conta <MoveRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
