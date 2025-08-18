'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Eye, EyeOff, Shield, User, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCrudToast } from '@/lib'
import { useSession } from '@/lib/hooks/use-session'
import { userService } from '@/lib/services/user'

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  avatarUrl: z.string().nullable().optional(),
})
type ProfileSchema = z.infer<typeof profileSchema>

const strongPassword = z
  .string()
  .min(8, 'Pelo menos 8 caracteres')
  .refine((v) => /[a-z]/.test(v), 'Inclua letra minúscula')
  .refine((v) => /[A-Z]/.test(v), 'Inclua letra maiúscula')
  .refine((v) => /\d/.test(v), 'Inclua número')
  .refine((v) => /[^\w\s]/.test(v), 'Inclua caractere especial')

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Pelo menos 6 caracteres'),
  newPassword: strongPassword,
})
type PasswordSchema = z.infer<typeof passwordSchema>

export default function PerfilPage() {
  const { data } = useSession()
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { success, error } = useCrudToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ProfileSchema>({ resolver: zodResolver(profileSchema) })

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors },
    watch: watchPw,
  } = useForm<PasswordSchema>({ resolver: zodResolver(passwordSchema) })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const newPasswordValue = watchPw('newPassword') || ''
  const showNewPwHint = newPasswordValue.length > 0
  const isNewPwValid = strongPassword.safeParse(newPasswordValue).success

  useEffect(() => {
    ;(async () => {
      try {
        const me = await userService.getMe()
        reset({ name: me.name, avatarUrl: me.avatarUrl || undefined })
      } catch {}
    })()
  }, [reset])

  const avatarUrl = watch('avatarUrl') || (data?.user as any)?.image || ''
  const initials = (data?.user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardContent className="space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Perfil */}
          <div>
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-primary" /> Perfil
            </div>
            <form
              className="space-y-4"
              onSubmit={handleSubmit(async (dataForm) => {
                setLoading(true)
                try {
                  await userService.updateProfile(dataForm)
                  success.update('Perfil')
                  setTimeout(() => window.location.reload(), 600)
                } catch (e: any) {
                  error.update(
                    'perfil',
                    e?.message || 'Erro ao atualizar perfil',
                  )
                } finally {
                  setLoading(false)
                }
              })}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">Nome</label>
                  <Input placeholder="Seu nome" {...register('name')} />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <Input value={data?.user?.email || ''} disabled />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Foto de perfil
                </label>
                <FileUpload
                  value={avatarUrl}
                  onChange={(value) => {
                    // Atualizar o valor do formulário
                    const event = {
                      target: { name: 'avatarUrl', value }
                    } as any
                    register('avatarUrl').onChange(event)
                  }}
                  placeholder="Selecionar foto de perfil"
                  fallbackText={data?.user?.name || 'Usuário'}
                  maxSize={5}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  uploadToServer={true}
                  onUploadStart={() => setUploading(true)}
                  onUploadSuccess={(url) => {
                    setUploading(false)
                    success.update('Foto de perfil')
                  }}
                  onUploadError={(errorMessage) => {
                    setUploading(false)
                    error.update('upload', errorMessage)
                  }}
                />
                {errors.avatarUrl && (
                  <p className="text-xs text-destructive mt-2">
                    {errors.avatarUrl.message}
                  </p>
                )}
              </div>

              <Button
                className="w-full sm:w-auto"
                disabled={loading || uploading}
                type="submit"
              >
                {uploading ? 'Fazendo upload...' : 'Salvar alterações'}
              </Button>
            </form>
          </div>

          {/* Segurança */}
          <Separator className="my-2" />
          <div>
            <div className="mb-4 mt-2 flex items-center gap-2 text-lg font-semibold">
              <Shield className="h-5 w-5 text-primary" /> Segurança
            </div>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={handleSubmitPw(async (dataForm) => {
                setPwLoading(true)
                try {
                  await userService.changePassword(dataForm)
                  success.update('Senha')
                  resetPw()
                } catch (e: any) {
                  error.update('senha', e?.message || 'Erro ao alterar senha')
                } finally {
                  setPwLoading(false)
                }
              })}
            >
              <div>
                <label className="text-sm text-muted-foreground">
                  Senha atual
                </label>
                <div className="relative">
                  <Input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerPw('currentPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                    onClick={() => setShowCurrent((v) => !v)}
                    aria-label="Mostrar/ocultar senha atual"
                  >
                    {showCurrent ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {pwErrors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {pwErrors.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Nova senha
                </label>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerPw('newPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label="Mostrar/ocultar nova senha"
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {pwErrors.newPassword && (
                  <p className="text-xs text-destructive">
                    {pwErrors.newPassword.message}
                  </p>
                )}
                {/* Feedback visual de força: mínimo 6 chars (regra atual) */}
                {showNewPwHint && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {isNewPwValid ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600">
                          Senha atende aos requisitos
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-destructive">
                          Senha inválida (mín. 8, com maiúscula, minúscula,
                          número e símbolo)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <Button
                  className="w-full sm:w-auto"
                  disabled={pwLoading}
                  type="submit"
                >
                  Atualizar senha
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
