import type React from 'react'
import { cn } from '@/shared/lib/cn'

type Color = 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'teal' | 'orange' | 'magenta' | 'gray'

const colorStyles: Record<Color, string> = {
  blue: 'bg-ads-accent-blue text-ads-text-inverse',
  red: 'bg-ads-accent-red text-ads-text-inverse',
  green: 'bg-ads-accent-green text-ads-text-inverse',
  yellow: 'bg-ads-accent-yellow text-ads-text-inverse',
  purple: 'bg-ads-accent-purple text-ads-text-inverse',
  teal: 'bg-ads-accent-teal text-ads-text-inverse',
  orange: 'bg-ads-accent-orange text-ads-text-inverse',
  magenta: 'bg-ads-accent-magenta text-ads-text-inverse',
  gray: 'bg-ads-bg-bold text-ads-text-inverse',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count?: number
  value?: number
  max?: number
  maxCount?: number
  color?: Color
  variant?: Color
  appearance?: 'default' | 'subtle'
  children?: React.ReactNode
}

export const Badge = ({
  count,
  value,
  max = 99,
  maxCount,
  color,
  variant,
  appearance = 'default',
  className,
  children,
  ...props
}: BadgeProps) => {
  const limit = maxCount ?? max
  const num = count ?? value
  const display = num === undefined ? children : num > limit ? `${limit}+` : num
  const c = (color ?? variant ?? 'blue') as Color
  return (
    <span
      className={cn(
        'inline-flex min-w-[1.25rem] items-center justify-center rounded-ads-full px-1.5 py-0.5 text-xs font-bold',
        appearance === 'subtle'
          ? 'bg-ads-bg-subtle text-ads-text'
          : (colorStyles[c] ?? colorStyles.blue),
        className,
      )}
      {...props}
    >
      {display}
    </span>
  )
}
Badge.displayName = 'Badge'
export default Badge
