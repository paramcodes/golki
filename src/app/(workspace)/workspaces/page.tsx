'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'

interface Workspace {
  id: string
  name: string
  slug: string
  projects: { id: string; key: string; name: string }[]
}

interface Membership {
  workspace: Workspace
  role: string
}

export default function WorkspacesPage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/workspaces')
      .then((r) => r.json())
      .then((data) => {
        const ms: Membership[] = (data.workspaces ?? []).map((w: any) => ({
          workspace: { id: w.id, name: w.name, slug: w.slug, projects: w.projects ?? [] },
          role: w.role,
        }))
        setMemberships(ms)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
  const [inviteModal, setInviteModal] = useState<{ open: boolean; workspaceId: string }>({
    open: false,
    workspaceId: '',
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const router = useRouter()

  const handleInvite = async (workspaceId: string) => {
    setIsInviting(true)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'invite',
          workspaceId,
          email: inviteEmail,
        }),
      })
      if (res.ok) {
        setInviteModal({ open: false, workspaceId: '' })
        setInviteEmail('')
        router.refresh()
      } else {
        alert('Failed to invite member')
      }
    } catch (error) {
      console.error('Invite failed:', error)
      alert('Failed to invite member')
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Workspaces</h1>
        <form action="/api/workspaces" method="post" className="flex gap-2">
          <input
            name="name"
            placeholder="Workspace name"
            required
            className="h-8 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm"
          />
          <Button type="submit" variant="primary">
            Create
          </Button>
        </form>
      </div>
      {loading ? (
        <p className="text-sm text-ads-text-subtle">Loading workspaces…</p>
      ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {memberships.map((m) => (
          <div
            key={m.workspace.id}
            className="rounded-ads-lg border border-ads-border bg-ads-bg p-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{m.workspace.name}</h2>
              {m.role === 'admin' && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setInviteModal({ open: true, workspaceId: m.workspace.id })}
                >
                  Invite member
                </Button>
              )}
            </div>
            <p className="text-sm text-ads-text-subtle">{m.workspace.projects.length} projects</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {m.workspace.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/w/${m.workspace.slug}/p/${p.key}`}
                  className="rounded-ads-md bg-ads-bg-subtle px-2 py-1 text-sm text-ads-text-link"
                >
                  {p.key} {p.name}
                </Link>
              ))}
            </div>
            <form action="/api/projects" method="post" className="mt-3 flex gap-2">
              <input type="hidden" name="workspaceSlug" value={m.workspace.slug} />
              <input
                name="key"
                placeholder="KEY"
                required
                maxLength={10}
                className="h-8 w-16 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm uppercase"
              />
              <input
                name="name"
                placeholder="Project name"
                required
                className="h-8 flex-1 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm"
              />
              <select
                name="type"
                className="h-8 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm"
              >
                <option value="kanban">Kanban</option>
                <option value="scrum">Scrum</option>
              </select>
              <Button type="submit" size="sm">
                Create
              </Button>
            </form>
          </div>
        ))}
      </div>
      )}

      <Modal
        open={inviteModal.open}
        onClose={() => setInviteModal({ open: false, workspaceId: '' })}
        title="Invite member"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleInvite(inviteModal.workspaceId)
          }}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="invite-email"
                className="block text-sm font-medium text-ads-text mb-1"
              >
                Email address
              </label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
                required
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => setInviteModal({ open: false, workspaceId: '' })}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isInviting}>
              Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
