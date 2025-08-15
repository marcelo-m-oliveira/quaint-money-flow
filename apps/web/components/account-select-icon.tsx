import {
  Building2,
  CreditCard,
  DollarSign,
  Landmark,
  PiggyBank,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { getBankIcon } from '@/lib/data/banks'

interface AccountSelectIconProps {
  icon: string
  iconType: 'bank' | 'generic'
  name: string
  size?: 'sm' | 'md'
}

const GENERIC_ICON_MAP = {
  wallet: Wallet,
  'credit-card': CreditCard,
  bank: Landmark,
  building: Building2,
  'piggy-bank': PiggyBank,
  'trending-up': TrendingUp,
  'dollar-sign': DollarSign,
}

export function AccountSelectIcon({
  icon,
  iconType,
  name,
  size = 'sm',
}: AccountSelectIconProps) {
  const containerSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <div
      className={`flex ${containerSize} items-center justify-center rounded-full border border-border`}
    >
      {iconType === 'bank' && icon ? (
        <img
          src={getBankIcon(icon, 'icon') || icon}
          alt={name}
          className="h-full w-full rounded-full object-contain p-0.5"
        />
      ) : iconType === 'generic' && icon ? (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          {(() => {
            const IconComponent =
              GENERIC_ICON_MAP[icon as keyof typeof GENERIC_ICON_MAP] ||
              CreditCard
            return (
              <IconComponent className={`${iconSize} text-muted-foreground`} />
            )
          })()}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          <CreditCard className={`${iconSize} text-muted-foreground`} />
        </div>
      )}
    </div>
  )
}
