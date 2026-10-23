import type React from 'react'
import { cn } from '@/shared/lib/cn'

export interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const EmptyState = ({ title, description, action, className }: EmptyStateProps) => (
  <div
    className={cn('flex flex-col items-center justify-center gap-2 py-12 text-center', className)}
  >
    <h3 className="text-base font-semibold text-ads-text">{title}</h3>
    {description ? <p className="max-w-md text-sm text-ads-text-subtle">{description}</p> : null}
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
)
export default EmptyState
