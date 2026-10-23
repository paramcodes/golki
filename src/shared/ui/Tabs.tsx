'use client'
import { cn } from '@/shared/lib/cn'

export interface TabItem {
  key: string
  label: string
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (key: string) => void
  className?: string
}

export const Tabs = ({ items, value, onChange, className }: TabsProps) => (
  <div className={cn('flex border-b border-ads-border', className)}>
    {items.map((item) => (
      <button
        type="button"
        key={item.key}
        onClick={() => onChange(item.key)}
        className={cn(
          'px-3 py-2 text-sm font-medium transition-colors',
          value === item.key
            ? 'border-b-2 border-ads-accent-blue text-ads-accent-blue'
            : 'text-ads-text-subtle hover:text-ads-text',
        )}
      >
        {item.label}
      </button>
    ))}
  </div>
)
export default Tabs
