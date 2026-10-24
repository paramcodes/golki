import type React from 'react'
import { cn } from '@/shared/lib/cn'

type Color =
  | 'blue'
  | 'red'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'teal'
  | 'orange'
  | 'magenta'
  | 'gray'
  | 'lime'

const colorStyles: Record<Color, string> = {
  blue: 'bg-ads-bg-information text-ads-accent-blue',
  red: 'bg-ads-bg-danger text-ads-accent-red',
  green: 'bg-ads-bg-success text-ads-accent-green',
  yellow: 'bg-ads-bg-warning text-ads-accent-yellow',
  purple: 'bg-ads-bg-discovery text-ads-accent-purple',
  teal: 'bg-ads-bg-information text-ads-accent-teal',
  orange: 'bg-ads-bg-warning text-ads-accent-orange',
  magenta: 'bg-ads-bg-discovery text-ads-accent-magenta',
  gray: 'bg-ads-bg-subtle text-ads-text-subtle',
  lime: 'bg-ads-bg-success text-ads-accent-green',
}

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: Color
  variant?: Color
  appearance?: 'subtle' | 'bold'
  removable?: boolean
  onRemove?: () => void
  onClose?: () => void
  children: React.ReactNode
}

export const Tag = ({
  color,
  variant,
  appearance = 'subtle',
  removable,
  onRemove,
  onClose,
  className,
  children,
  ...props
}: TagProps) => {
  const c = (color ?? variant ?? 'gray') as Color
  const handleRemove = onRemove ?? onClose
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-ads-full px-2 py-0.5 text-xs font-medium',
        appearance === 'bold' ? 'font-semibold' : '',
        colorStyles[c] ?? colorStyles.gray,
        className,
      )}
      {...props}
    >
      {children}
      {removable ? (
        <button
          type="button"
          aria-label="Remove"
          onClick={handleRemove}
          className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:opacity-70"
        >
          ×
        </button>
      ) : null}
    </span>
  )
}
Tag.displayName = 'Tag'
export default Tag
