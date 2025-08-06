import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
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
    <html lang="pt-br" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <BankIconsProvider>{children}</BankIconsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
