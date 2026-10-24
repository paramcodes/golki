'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'

interface Workspace {
  id: string
  name: string
  slug: string
}

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace
  workspaces: Workspace[]
  onSwitch: (workspace: Workspace) => void
}

export function WorkspaceSwitcher({
  currentWorkspace,
  workspaces,
  onSwitch,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitch = (workspace: Workspace) => {
    onSwitch(workspace)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant="default"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between gap-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-ads-accent-blue" />
          <span className="text-sm font-medium text-ads-text truncate">
            {currentWorkspace.name}
          </span>
        </div>
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-ads-lg bg-ads-bg border border-ads-border shadow-lg overflow-hidden"
          role="listbox"
        >
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => handleSwitch(ws)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm transition-colors',
                ws.id === currentWorkspace.id
                  ? 'bg-ads-bg-subtle text-ads-text font-medium'
                  : 'text-ads-text hover:bg-ads-bg-subtle',
              )}
              role="option"
              aria-selected={ws.id === currentWorkspace.id}
            >
              {ws.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
