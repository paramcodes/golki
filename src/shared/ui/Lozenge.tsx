import type React from 'react'
import { cn } from '@/shared/lib/cn'

type Appearance = 'default' | 'success' | 'removed' | 'inprogress' | 'new' | 'moved'

const styles: Record<Appearance, string> = {
  default: 'bg-ads-bg-subtle text-ads-text',
  success: 'bg-ads-bg-success text-ads-accent-green',
  removed: 'bg-ads-bg-danger text-ads-accent-red',
  inprogress: 'bg-ads-bg-information text-ads-accent-blue',
  new: 'bg-ads-bg-discovery text-ads-accent-purple',
  moved: 'bg-ads-bg-warning text-ads-accent-orange',
}

export interface LozengeProps extends React.HTMLAttributes<HTMLSpanElement> {
  appearance?: Appearance
  isBold?: boolean
  children: React.ReactNode
}

export const Lozenge = ({
  appearance = 'default',
  isBold,
  className,
  children,
  ...props
}: LozengeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-ads-full px-2 py-0.5 text-xs font-medium',
      isBold && 'font-bold',
      styles[appearance],
      className,
    )}
    {...props}
  >
    {children}
  </span>
)
export default Lozenge
