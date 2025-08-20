import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AccountsProvider } from '@/lib/contexts/accounts-context'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { BankIconsProvider } from '@/lib/contexts/bank-icons-context'
import { CreditCardsProvider } from '@/lib/contexts/credit-cards-context'
import { UserPreferencesProvider } from '@/lib/contexts/user-preferences-context'

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
          <AuthProvider>
            <AccountsProvider>
              <CreditCardsProvider>
                <BankIconsProvider>
                  <UserPreferencesProvider>{children}</UserPreferencesProvider>
                </BankIconsProvider>
              </CreditCardsProvider>
            </AccountsProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
