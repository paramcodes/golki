import React from 'react'
import { cn } from '@/shared/lib/cn'

export interface SelectOption {
  label: React.ReactNode
  value: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: SelectOption[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, children, ...props }, ref) => {
    const autoId = React.useId()
    const selectId = id ?? autoId
    return (
      <div className="flex flex-col gap-1">
        {label ? (
          <label htmlFor={selectId} className="text-xs font-medium text-ads-text-subtle">
            {label}
          </label>
        ) : null}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'h-8 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm text-ads-text focus:border-ads-border-focused focus:outline-none',
            error && 'border-ads-accent-red',
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        {error ? <span className="text-xs text-ads-accent-red">{error}</span> : null}
      </div>
    )
  },
)
Select.displayName = 'Select'
export default Select
