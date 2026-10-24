/* biome-ignore-all lint/suspicious/noArrayIndexKey: skeleton repeats identical blocks */
import type React from 'react'
import { cn } from '@/shared/lib/cn'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  circle?: boolean
  rounded?: boolean
  count?: number
}

export const Skeleton = ({
  width,
  height,
  circle,
  rounded = true,
  count = 1,
  className,
  style,
  ...props
}: SkeletonProps) => {
  const items = Array.from({ length: count })
  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-ads-bg-subtle',
            rounded && !circle ? 'rounded-ads-md' : '',
            circle ? 'rounded-full' : '',
            className,
          )}
          style={{ width, height, ...style }}
          {...props}
        />
      ))}
    </>
  )
}
Skeleton.displayName = 'Skeleton'
export default Skeleton
