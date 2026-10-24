import type React from 'react'
import { cn } from '@/shared/lib/cn'

export interface TooltipProps {
  content?: React.ReactNode
  label?: React.ReactNode
  text?: React.ReactNode
  title?: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  open?: boolean
  defaultOpen?: boolean
  className?: string
}

const sideClasses: Record<NonNullable<TooltipProps['side']>, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1',
}

export const Tooltip = ({
  content,
  label,
  text,
  title,
  children,
  side = 'top',
  open,
  className,
}: TooltipProps) => {
  const tip = content ?? label ?? text ?? title
  const visibleClass = open ? '' : 'hidden group-hover:block group-focus-within:block'
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'absolute z-50 whitespace-nowrap rounded-ads-md bg-ads-bg-bold px-2 py-1 text-xs text-ads-text-inverse shadow-lg',
          sideClasses[side],
          visibleClass,
          className,
        )}
      >
        {tip}
      </span>
    </span>
  )
}
Tooltip.displayName = 'Tooltip'
export default Tooltip
