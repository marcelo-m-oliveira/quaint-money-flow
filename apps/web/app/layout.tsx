import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { BankIconsProvider } from '@/lib/contexts/bank-icons-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quaint Money',
  description: 'A simple money application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-br" className="dark">
      <body className={inter.className}>
        <BankIconsProvider>{children}</BankIconsProvider>
      </body>
    </html>
  )
}
