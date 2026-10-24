/* biome-ignore-all lint/suspicious/noArrayIndexKey: items lack stable ids */
'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'

export interface DropdownItem {
  label: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export interface DropdownProps {
  trigger?: React.ReactNode
  items?: DropdownItem[]
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  align?: 'start' | 'end'
  className?: string
  menuClassName?: string
}

export const Dropdown = ({
  trigger,
  items,
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onClose,
  align = 'start',
  className,
  menuClassName,
}: DropdownProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? Boolean(controlledOpen) : internalOpen
  const containerRef = useRef<HTMLDivElement>(null)

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
      if (!next) onClose?.()
    },
    [isControlled, onOpenChange, onClose],
  )

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handler)
      document.addEventListener('keydown', keyHandler)
    }
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [open, setOpen])

  const triggerNode = trigger ? (
    React.isValidElement(trigger) ? (
      React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
        onClick: (e: React.MouseEvent) => {
          const original = (trigger as { props?: { onClick?: (e: React.MouseEvent) => void } })
            .props?.onClick
          original?.(e)
          setOpen(!open)
        },
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        onKeyDown: (e: React.KeyboardEvent) => {
          const original = (trigger as { props?: { onKeyDown?: (e: React.KeyboardEvent) => void } })
            .props?.onKeyDown
          original?.(e)
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        },
      })
    ) : (
      trigger
    )
  ) : (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault()
          setOpen(true)
        }
      }}
      className="inline-flex h-8 items-center rounded-ads-md border border-ads-border bg-ads-bg px-3 text-sm text-ads-text hover:bg-ads-bg-subtle"
    >
      Menu
    </button>
  )

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {triggerNode}
      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-[10rem] rounded-ads-md border border-ads-border bg-ads-bg py-1 shadow-lg',
            align === 'end' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {items?.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onClick?.()
                setOpen(false)
              }}
              className={cn(
                'block w-full px-3 py-1.5 text-left text-sm text-ads-text hover:bg-ads-bg-subtle disabled:opacity-50',
                item.className,
              )}
            >
              {item.label}
            </button>
          ))}
          {children}
        </div>
      ) : null}
    </div>
  )
}
Dropdown.displayName = 'Dropdown'
export default Dropdown
