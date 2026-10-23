'use client'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Issue as PrismaIssue } from '@/generated/prisma'
import { Avatar, Button, EmptyState, Input, Modal } from '@/shared/ui'

type Issue = PrismaIssue & { assignee?: { name?: string | null } | null }

const STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'in_review', label: 'In Review' },
  { key: 'done', label: 'Done' },
]

export function BoardClient({
  project,
}: {
  project: { id: string; key: string; name: string; issues: Issue[] }
}) {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>(project.issues)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const moveIssue = useCallback(async (issueId: string, newStatus: string) => {
    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)))
    await fetch(`/api/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }, [])

  async function createIssue() {
    if (!title.trim()) return
    setSaving(true)
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, title }),
    })
    setSaving(false)
    if (res.ok) {
      const issue = await res.json()
      setIssues((prev) => [...prev, issue])
      setTitle('')
      setCreating(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ads-border px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">
            {project.key} {project.name}
          </h1>
          <p className="text-sm text-ads-text-subtle">Board</p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          Create issue
        </Button>
      </div>
      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {STATUSES.map((col) => (
          <Column
            key={col.key}
            status={col.key}
            label={col.label}
            issues={issues.filter((i) => i.status === col.key)}
            onDropIssue={moveIssue}
            onOpen={(id) => router.push(`/issue/${id}`)}
          />
        ))}
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Create issue"
        footer={
          <>
            <Button onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" onClick={createIssue} loading={saving}>
              Create
            </Button>
          </>
        }
      >
        <Input label="Summary" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </Modal>
    </div>
  )
}

function Column({
  status,
  label,
  issues,
  onDropIssue,
  onOpen,
}: {
  status: string
  label: string
  issues: Issue[]
  onDropIssue: (issueId: string, status: string) => void
  onOpen: (id: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return dropTargetForElements({
      element: el,
      onDrop: ({ source }) => {
        const id = (source.data as { issueId?: string }).issueId
        if (id) onDropIssue(id, status)
      },
    })
  }, [status, onDropIssue])

  return (
    <div ref={ref} className="flex w-72 shrink-0 flex-col rounded-ads-lg bg-ads-bg-subtle p-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-ads-text">{label}</span>
        <span className="rounded-ads-full bg-ads-bg px-2 py-0.5 text-xs text-ads-text-subtle">
          {issues.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {issues.length === 0 ? <EmptyState title="No issues" /> : null}
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

function IssueCard({ issue, onOpen }: { issue: Issue; onOpen: (id: string) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return draggable({
      element: el,
      getInitialData: () => ({ issueId: issue.id }),
    })
  }, [issue.id])

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => onOpen(issue.id)}
      className="w-full cursor-grab rounded-ads-md border border-ads-border bg-ads-bg p-3 text-left shadow-sm hover:shadow"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-ads-text-subtlest">{issue.key}</span>
        <span className="text-xs text-ads-text-subtle">{issue.priority}</span>
      </div>
      <p className="text-sm font-medium text-ads-text">{issue.title}</p>
      <div className="mt-2 flex items-center gap-2">
        {issue.assignee ? <Avatar name={issue.assignee.name ?? undefined} size="xs" /> : null}
        <span className="text-xs text-ads-text-subtlest">{issue.type}</span>
      </div>
    </button>
  )
}
