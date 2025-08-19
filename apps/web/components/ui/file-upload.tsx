'use client'

import { Camera, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { uploadService } from '@/lib/services/upload'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxSize?: number // em MB
  acceptedTypes?: string[]
  fallbackText?: string
  uploadToServer?: boolean
  onUploadStart?: () => void
  onUploadSuccess?: (url: string) => void
  onUploadError?: (error: string) => void
}

export function FileUpload({
  value,
  onChange,
  placeholder = 'Selecionar arquivo',
  className,
  disabled = false,
  maxSize = 5, // 5MB por padrão
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  fallbackText = 'Foto',
  uploadToServer = false,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validar tipo de arquivo
    if (!acceptedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.')
      return
    }

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`)
      return
    }

    if (uploadToServer) {
      // Converter para base64 primeiro
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string
        try {
          onUploadStart?.()
          const response = await uploadService.uploadAvatar(result)
          onChange(response.url)
          onUploadSuccess?.(response.url)
        } catch (error: any) {
          const errorMessage =
            error?.message || 'Erro ao fazer upload do arquivo'
          setError(errorMessage)
          onUploadError?.(errorMessage)
        }
      }
      reader.readAsDataURL(file)
    } else {
      // Converter para base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    onChange(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const initials = fallbackText
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-4">
          {value ? (
            <Avatar className="h-20 w-20">
              <AvatarImage src={value} alt="Foto de perfil" />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-medium">
              {value ? 'Foto selecionada' : placeholder}
            </p>
            <p className="text-xs text-muted-foreground">
              Arraste uma imagem aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou WebP até {maxSize}MB
            </p>
          </div>

          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="mt-2"
            >
              <X className="mr-2 h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
