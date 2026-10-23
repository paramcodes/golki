'use client'
import type React from 'react'
import { cn } from '@/shared/lib/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

export const Modal = ({ open, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className={cn('relative z-10 w-full rounded-ads-lg bg-ads-bg shadow-lg', sizeClasses[size])}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-ads-border px-4 py-3">
            <h2 className="text-base font-semibold text-ads-text">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-ads-text-subtle hover:text-ads-text"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        ) : null}
        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-ads-border px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
export default Modal
