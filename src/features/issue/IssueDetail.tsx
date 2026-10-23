'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar, Button, Lozenge, Textarea } from '@/shared/ui'

type IssueData = {
  id: string
  key: string
  title: string
  description: string | null
  status: string
  priority: string
  type: string
  assignee?: { id: string; name: string | null } | null
  reporter?: { id: string; name: string | null } | null
  project: { key: string; name: string }
  comments: {
    id: string
    body: string
    author: { name: string | null } | null
    createdAt: string | Date
  }[]
  labels: { label: { id: string; name: string; color: string } }[]
}

export function IssueDetail({ issue }: { issue: IssueData }) {
  const router = useRouter()
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description ?? '')
  const [status, setStatus] = useState(issue.status)
  const [saving, setSaving] = useState(false)
  const [comment, setComment] = useState('')

  async function save() {
    setSaving(true)
    await fetch(`/api/issues/${issue.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status }),
    })
    setSaving(false)
    router.refresh()
  }

  async function addComment() {
    if (!comment.trim()) return
    await fetch(`/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId: issue.id, body: comment }),
    })
    setComment('')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-ads-text-subtlest">{issue.key}</span>
        <Lozenge>{issue.type}</Lozenge>
        <Lozenge appearance={issue.priority === 'highest' ? 'removed' : 'default'}>
          {issue.priority}
        </Lozenge>
      </div>
      <InputLike value={title} onChange={setTitle} />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-3"
      />
      <div className="mt-4 flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-8 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm"
        >
          {['todo', 'in_progress', 'in_review', 'done'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button variant="primary" onClick={save} loading={saving}>
          Save
        </Button>
        <Button onClick={() => router.back()}>Back</Button>
      </div>

      <div className="mt-8">
        <h3 className="mb-2 text-sm font-semibold text-ads-text">Comments</h3>
        <div className="space-y-3">
          {issue.comments.map((c) => (
            <div
              key={c.id}
              className="rounded-ads-md border border-ads-border bg-ads-bg-subtle p-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <Avatar name={c.author?.name ?? undefined} size="xs" />
                <span className="text-xs text-ads-text-subtle">{c.author?.name}</span>
              </div>
              <p className="text-sm text-ads-text">{c.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1"
          />
          <Button variant="primary" onClick={addComment}>
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}

function InputLike({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 py-1 text-lg font-semibold text-ads-text focus:border-ads-border-focused focus:outline-none"
    />
  )
}
