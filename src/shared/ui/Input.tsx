import React from 'react'
import { cn } from '@/shared/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const autoId = React.useId()
    const inputId = id ?? autoId
    return (
      <div className="flex flex-col gap-1">
        {label ? (
          <label htmlFor={inputId} className="text-xs font-medium text-ads-text-subtle">
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-8 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm text-ads-text placeholder:text-ads-text-subtlest focus:border-ads-border-focused focus:outline-none',
            error && 'border-ads-accent-red',
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs text-ads-accent-red">{error}</span> : null}
      </div>
    )
  },
)
Input.displayName = 'Input'
export default Input
