'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SearchBar } from '@/shared/ui/SearchBar'
import { WorkspaceSwitcher } from '@/shared/ui/WorkspaceSwitcher'

interface Workspace {
  id: string
  name: string
  slug: string
}

interface HeaderProps {
  currentWorkspace: Workspace
}

export function Header({ currentWorkspace }: HeaderProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch('/api/workspaces')
        if (res.ok) {
          const data = await res.json()
          setWorkspaces(data.workspaces ?? [])
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWorkspaces()
  }, [])

  const handleSwitch = (workspace: Workspace) => {
    router.push(`/w/${workspace.slug}`)
    router.refresh()
  }

  if (isLoading) {
    return (
      <header className="h-14 border-b border-ads-border bg-ads-bg/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-screen-2xl flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/w" className="text-lg font-bold text-ads-text">
              golki
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="h-14 border-b border-ads-border bg-ads-bg/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-screen-2xl flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/w" className="text-lg font-bold text-ads-text">
            golki
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href={`/w/${currentWorkspace.slug}`}
              className="px-2 py-1 text-sm text-ads-text-subtle hover:text-ads-text"
            >
              Board
            </Link>
            <Link
              href={`/w/${currentWorkspace.slug}/backlog`}
              className="px-2 py-1 text-sm text-ads-text-subtle hover:text-ads-text"
            >
              Backlog
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <SearchBar />
        </div>

        <div className="flex items-center gap-3">
          <WorkspaceSwitcher
            currentWorkspace={currentWorkspace}
            workspaces={workspaces}
            onSwitch={handleSwitch}
          />
          <div className="h-6 w-px bg-ads-border" />
          <Link
            href={`/w/${currentWorkspace.slug}/settings`}
            className="px-3 py-1 text-sm text-ads-text-subtle hover:text-ads-text"
          >
            Settings
          </Link>
        </div>
      </div>
    </header>
  )
}
