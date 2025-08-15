'use client'

import { useEffect, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  requiresTimer?: boolean
  timerSeconds?: number
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  requiresTimer = false,
  timerSeconds = 10,
}: ConfirmationDialogProps) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds)
  const [isTimerActive, setIsTimerActive] = useState(false)

  useEffect(() => {
    if (isOpen && requiresTimer) {
      setTimeLeft(timerSeconds)
      setIsTimerActive(true)
    } else {
      setIsTimerActive(false)
    }
  }, [isOpen, requiresTimer, timerSeconds])

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setIsTimerActive(false)
    }
  }, [isTimerActive, timeLeft])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const isConfirmDisabled = requiresTimer && timeLeft > 0

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            {requiresTimer && timeLeft > 0 && (
              <div className="mt-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Aguarde {timeLeft} segundo{timeLeft !== 1 ? 's' : ''} para
                  confirmar
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50'
                : 'disabled:opacity-50'
            }
          >
            {isConfirmDisabled ? `Aguarde (${timeLeft}s)` : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
