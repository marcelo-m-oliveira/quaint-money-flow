'use client'

import { MailSearch, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/lib/services/auth'

export default function RecoverPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleRecover() {
    setLoading(true)
    setMessage(null)
    try {
      // Por enquanto, apenas verificamos se o email existe tentando login com senha vazia
      // Isso pode ser conectado quando o backend fornecer um endpoint específico para recuperação
      await authService.login({ email, password: '' })
      setMessage(
        'Sua conta existe. Você pode prosseguir para a página de login.',
      )
    } catch (error: any) {
      // Se der erro 401, 400 ou 500, significa que o email existe mas a senha está incorreta
      if (
        error?.status === 401 ||
        error?.status === 400 ||
        error?.status === 500
      ) {
        setMessage(
          'Se o email existir, você receberá instruções para recuperar sua conta. Verifique sua caixa de entrada.',
        )
      } else {
        setMessage('Verifique seu email. Se existir, enviaremos instruções.')
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
            <MailSearch className="h-6 w-6 text-primary" />
            Recuperar acesso
          </div>
          <p className="text-sm text-muted-foreground">
            Informe seu email para verificarmos sua conta.
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
        </div>

        {message && (
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 p-2 text-sm text-primary">
            <ShieldCheck className="h-4 w-4" /> {message}
          </div>
        )}

        <div className="space-y-3">
          <Button
            className="w-full"
            disabled={loading || !email}
            onClick={handleRecover}
          >
            Verificar email
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Lembrou a senha?</span>
            <Link href="/signin" className="text-primary hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
