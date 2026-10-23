import { cn } from '@/shared/lib/cn'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }

export const Spinner = ({ size = 'md', className }: SpinnerProps) => (
  <span
    className={cn(
      'inline-block animate-spin rounded-full border-2 border-ads-border border-t-ads-accent-blue',
      sizes[size],
      className,
    )}
  />
)
export default Spinner
