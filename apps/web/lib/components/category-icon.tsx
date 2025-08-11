// Componente para renderizar ícone de categoria
import { getIconComponent } from '@/lib'

interface CategoryIconProps {
  iconName: string
  className?: string
  size?: number
}

export function CategoryIcon({
  iconName,
  className = '',
  size = 16,
}: CategoryIconProps) {
  const IconComponent = getIconComponent(iconName)
  return <IconComponent className={className} size={size} />
}
