'use client'

import { ReactNode } from 'react'

import { Topbar } from '../topbar'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  containerClassName?: string
}

export function PageLayout({
  children,
  className = '',
  containerClassName = '',
}: PageLayoutProps) {
  return (
    <div className={`flex min-h-screen flex-col bg-background ${className}`}>
      {/* Header */}
      <Topbar />

      {/* Main Content */}
      <main
        className={`container mx-auto flex-1 px-4 py-6 lg:py-8 ${containerClassName}`}
      >
        {children}
      </main>
    </div>
  )
}
