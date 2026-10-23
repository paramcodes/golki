import React from 'react'
import { cn } from '@/shared/lib/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'min-h-[80px] rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 py-1 text-sm text-ads-text placeholder:text-ads-text-subtlest focus:border-ads-border-focused focus:outline-none',
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
Textarea.displayName = 'Textarea'
export default Textarea
