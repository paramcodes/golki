import { cn } from '@/shared/lib/cn'

const sizes = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
}

export interface AvatarProps {
  name?: string
  src?: string
  size?: keyof typeof sizes
  className?: string
}

export const Avatar = ({ name, src, size = 'md', className }: AvatarProps) => {
  const initials = (name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-ads-accent-blue text-ads-text-inverse font-medium overflow-hidden',
        sizes[size],
        className,
      )}
    >
      {src ? (
        // biome-ignore lint/performance/noImgElement: avatar uses native img for simplicity
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  )
}
export default Avatar
