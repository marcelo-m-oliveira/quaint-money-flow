import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthSessionProvider } from '@/components/auth-session-provider'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AccountsProvider } from '@/lib/contexts/accounts-context'
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
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AccountsProvider>
              <CreditCardsProvider>
                <BankIconsProvider>
                  <UserPreferencesProvider>{children}</UserPreferencesProvider>
                </BankIconsProvider>
              </CreditCardsProvider>
            </AccountsProvider>
            <Toaster />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
