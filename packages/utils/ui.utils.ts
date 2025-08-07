/**
 * Utilitários para componentes de UI
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina classes CSS de forma inteligente usando clsx e tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gera uma cor aleatória em formato hexadecimal
 */
export function generateRandomColor(): string {
  const colors = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#6366f1', // indigo-500
    '#84cc16', // lime-500
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Verifica se uma cor é clara ou escura
 */
export function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}
