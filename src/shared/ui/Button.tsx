import React from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'default' | 'subtle' | 'danger' | 'link'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ads-accent-blue text-ads-text-inverse hover:bg-ads-accent-blue-bold disabled:opacity-50',
  default:
    'bg-ads-bg text-ads-text border border-ads-border hover:bg-ads-bg-subtle disabled:opacity-50',
  subtle: 'bg-transparent text-ads-text hover:bg-ads-bg-subtle disabled:opacity-50',
  danger: 'bg-ads-accent-red text-ads-text-inverse hover:opacity-90 disabled:opacity-50',
  link: 'bg-transparent text-ads-text-link hover:underline disabled:opacity-50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2 text-sm rounded-ads-sm',
  md: 'h-8 px-3 text-sm rounded-ads-md',
  lg: 'h-10 px-4 text-base rounded-ads-md',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ads-border-focused',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
export default Button
