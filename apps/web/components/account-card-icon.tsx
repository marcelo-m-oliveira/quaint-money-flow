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
    <div className="flex items-center gap-1">
      <span>•</span>
      <div className="flex items-center gap-1">
        {account.iconType === 'bank' ? (
          <img
            src={getBankIcon(account.icon, 'icon') || account.icon}
            alt={account.name}
            className="h-3 w-3 rounded-full object-contain"
          />
        ) : (
          <div className="flex h-3 w-3 items-center justify-center">
            {GENERIC_ICON_MAP[account.icon as keyof typeof GENERIC_ICON_MAP] ||
              '💳'}
          </div>
        )}
        <span className="max-w-20 truncate">{account.name}</span>
      </div>
    </div>
  )
}