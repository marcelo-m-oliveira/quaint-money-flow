import { getBankIcon } from '@/lib/data/banks'
import { Entry } from '@/lib/types'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

interface AccountCardIconProps {
  entry: Entry
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

export function AccountCardIcon({ entry }: AccountCardIconProps) {
  const account = entry.accountId ? entry.account : entry.creditCard
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="max-w-24 cursor-help truncate font-medium">
              {account.name}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{account.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
