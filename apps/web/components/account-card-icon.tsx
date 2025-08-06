import { getBankIcon } from '@/lib/data/banks'
import { Account, CreditCard, Transaction } from '@/lib/types'

interface AccountCardIconProps {
  transaction: Transaction
  accounts: Account[]
  creditCards: CreditCard[]
}

const GENERIC_ICON_MAP = {
  wallet: '💳',
  'credit-card': '💳',
  bank: '🏦',
  building: '🏢',
  'piggy-bank': '🐷',
  'trending-up': '📈',
  'dollar-sign': '💰',
}

export function AccountCardIcon({
  transaction,
  accounts,
  creditCards,
}: AccountCardIconProps) {
  const account = transaction.accountId
    ? accounts.find((acc) => acc.id === transaction.accountId)
    : creditCards.find((card) => card.id === transaction.creditCardId)

  if (!account) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {account.iconType === 'bank' ? (
        <img
          src={getBankIcon(account.icon, 'icon') || account.icon}
          alt={account.name}
          className="h-5 w-5 rounded-full object-contain"
        />
      ) : (
        <div className="flex h-5 w-5 items-center justify-center text-sm">
          {GENERIC_ICON_MAP[account.icon as keyof typeof GENERIC_ICON_MAP] ||
            '💳'}
        </div>
      )}
      <span className="max-w-24 truncate font-medium">{account.name}</span>
    </div>
  )
}
