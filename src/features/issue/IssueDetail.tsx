'use client'
import PlaceholderExtension from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Avatar, Button, Input, Lozenge, Modal, Textarea } from '@/shared/ui'

type UserMention = { id: string; name: string | null }

type IssueData = {
  id: string
  key: string
  title: string
  description: string | null
  status: string
  priority: string
  type: string
  estimate: number | null
  sprintId: string | null
  sprint?: {
    id: string
    name: string
    startDate: string | Date | null
    endDate: string | Date | null
  } | null
  assignee?: { id: string; name: string | null } | null
  reporter?: { id: string; name: string | null } | null
  project: {
    key: string
    name: string
    id: string
    members?: { user: { id: string; name: string | null } }[]
  }
  comments: {
    id: string
    body: string
    author: { name: string | null; id: string } | null
    createdAt: string | Date
    updatedAt: string | Date
  }[]
  labels: { label: { id: string; name: string; color: string } }[]
}

const issueTypes = ['task', 'story', 'bug', 'epic']
const priorities = ['low', 'medium', 'high', 'highest']
const statuses = ['todo', 'in_progress', 'in_review', 'done']

function InputLike({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 py-1 text-lg font-semibold text-ads-text focus:border-ads-border-focused focus:outline-none"
    />
  )
}

function SelectLike({
  id,
  value,
  onChange,
  options,
  disabled,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'h-8 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm text-ads-text focus:border-ads-border-focused focus:outline-none',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

// Basic @mention rendering - replace @username with styled span
function renderMentionNodes(text: string, users: UserMention[]): React.ReactNode {
  if (!text) return text

  let result: React.ReactNode = text
  for (const user of users) {
    const userName = user.name
    if (!userName) continue
    const mentionText = `@${userName}`
    const regex = new RegExp(`(${mentionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g')
    const parts = text.split(regex)
    if (parts.length > 1) {
      const nodes: React.ReactNode[] = []
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (part?.startsWith('@') && part === mentionText && user.id) {
          nodes.push(
            <span
              key={i}
              className="mention bg-ads-accent-blue/10 text-ads-accent-blue px-1 rounded"
              data-user-id={user.id}
            >
              {part}
            </span>,
          )
        } else if (part) {
          nodes.push(part)
        }
      }
      result = nodes
      text = parts.join('')
    }
  }
  return result
}

function CommentItem({
  comment,
  isEditing,
  editText,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onDeleteClick,
  onEditTextChange,
  projectMembers,
}: {
  comment: IssueData['comments'][0]
  isEditing: boolean
  editText: string
  onEditClick: () => void
  onSaveClick: () => void
  onCancelClick: () => void
  onDeleteClick: () => void
  onEditTextChange: (v: string) => void
  projectMembers: UserMention[]
}) {
  return (
    <div className="rounded-ads-md border border-ads-border bg-ads-bg-subtle p-3">
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            rows={3}
            className="min-h-[60px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="default" size="sm" onClick={onCancelClick}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={onSaveClick}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-1 flex items-center gap-2">
            <Avatar name={comment.author?.name ?? undefined} size="xs" />
            <span className="text-xs text-ads-text-subtle">{comment.author?.name}</span>
            <span className="text-xs text-ads-text-subtlest">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-ads-text-subtlest">(edited)</span>
            )}
          </div>
          <p className="text-sm text-ads-text">
            {renderMentionNodes(comment.body, projectMembers)}
          </p>
          <div className="mt-2 flex gap-2">
            <Button variant="link" size="sm" onClick={onEditClick}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={onDeleteClick}>
              Delete
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export function IssueDetail({ issue: initialIssue }: { issue: IssueData }) {
  const router = useRouter()
  const [issue, setIssue] = useState(initialIssue)
  const [saving, setSaving] = useState(false)
  const [comment, setComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState(issue.title)
  const [status, setStatus] = useState(issue.status)
  const [type, setType] = useState(issue.type)
  const [priority, setPriority] = useState(issue.priority)
  const [assigneeId, setAssigneeId] = useState<string | undefined>(issue.assignee?.id ?? undefined)
  const [estimate, setEstimate] = useState<number | undefined>(issue.estimate ?? undefined)
  const [sprintId, setSprintId] = useState<string | undefined>(issue.sprintId ?? undefined)
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    (issue.labels ?? []).map((l) => l.label.id),
  )
  const [error, setError] = useState<string | null>(null)
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null)

  const projectMembers =
    initialIssue.project.members
      ?.map((m) => m.user)
      .filter((u): u is UserMention => u !== null && u.name !== null) ?? []

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...projectMembers.map((u) => ({ value: u.id, label: u.name ?? 'Unknown' })),
  ]

  const editor = useEditor({
    extensions: [
      StarterKit,
      PlaceholderExtension.configure({
        placeholder: 'Write a description...',
      }),
    ],
    content: issue.description ?? '',
    editable: true,
    onUpdate: ({ editor }) => {
      setIssue((prev) => ({ ...prev, description: editor.getHTML() }))
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px]',
      },
    },
  })

  editorRef.current = editor

  useEffect(() => {
    setIssue(initialIssue)
    setTitle(initialIssue.title)
    setStatus(initialIssue.status)
    setType(initialIssue.type)
    setPriority(initialIssue.priority)
    setAssigneeId(initialIssue.assignee?.id ?? undefined)
    setEstimate(initialIssue.estimate ?? undefined)
    setSprintId(initialIssue.sprintId ?? undefined)
    setSelectedLabels((initialIssue.labels ?? []).map((l) => l.label.id))
  }, [initialIssue])

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: editor?.getHTML() ?? '',
          status,
          type,
          priority,
          assigneeId: assigneeId ?? null,
          estimate: estimate ?? null,
          sprintId: sprintId ?? null,
          labels: selectedLabels,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.refresh()
    } catch (_e) {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function addComment() {
    if (!comment.trim()) return
    try {
      await fetch(`/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId: issue.id, body: comment }),
      })
      setComment('')
      router.refresh()
    } catch {
      setError('Failed to add comment')
    }
  }

  async function updateComment(commentId: string) {
    if (!editingCommentText.trim()) return
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editingCommentText }),
      })
      setEditingCommentId(null)
      setEditingCommentText('')
      router.refresh()
    } catch {
      setError('Failed to update comment')
    }
  }

  async function deleteComment(commentId: string) {
    if (!confirm('Delete this comment?')) return
    try {
      await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      setError('Failed to delete comment')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/issues/${issue.id}`, { method: 'DELETE' })
      router.push(`/w/${issue.project.key}`)
    } catch {
      setError('Failed to delete issue')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  function toggleLabel(labelId: string) {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId],
    )
  }

  const sprintOptions = [
    { value: '', label: 'No sprint' },
    ...(issue.sprint ? [{ value: issue.sprint.id, label: issue.sprint.name }] : []),
  ]

  return (
    <div className="mx-auto max-w-4xl p-6">
      {error && (
        <div className="mb-4 rounded-ads-md bg-ads-bg-danger text-ads-accent-red px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-ads-text-subtlest">{issue.key}</span>
        <Lozenge>{issue.type}</Lozenge>
        <Lozenge appearance={issue.priority === 'highest' ? 'removed' : 'default'}>
          {issue.priority}
        </Lozenge>
      </div>

      <InputLike value={title} onChange={setTitle} />

      <div className="mt-3">
        <label htmlFor="issue-description" className="text-xs font-medium text-ads-text-subtle">
          Description
        </label>
        {editor && (
          <div
            id="issue-description"
            className="prose prose-sm max-w-none focus:outline-none min-h-[120px] border border-ads-border-input bg-ads-bg-input rounded-ads-md p-3"
          >
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="issue-status" className="text-xs font-medium text-ads-text-subtle">
            Status
          </label>
          <SelectLike
            id="issue-status"
            value={status}
            onChange={setStatus}
            options={statuses.map((s) => ({ value: s, label: s }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="issue-type" className="text-xs font-medium text-ads-text-subtle">
            Type
          </label>
          <SelectLike
            id="issue-type"
            value={type}
            onChange={setType}
            options={issueTypes.map((t) => ({ value: t, label: t }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="issue-priority" className="text-xs font-medium text-ads-text-subtle">
            Priority
          </label>
          <SelectLike
            id="issue-priority"
            value={priority}
            onChange={setPriority}
            options={priorities.map((p) => ({ value: p, label: p }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="issue-assignee" className="text-xs font-medium text-ads-text-subtle">
            Assignee
          </label>
          <SelectLike
            id="issue-assignee"
            value={assigneeId ?? ''}
            onChange={(v) => setAssigneeId(v || undefined)}
            options={assigneeOptions}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="issue-estimate" className="text-xs font-medium text-ads-text-subtle">
            Estimate (h)
          </label>
          <Input
            id="issue-estimate"
            type="number"
            value={estimate?.toString() ?? ''}
            onChange={(e) => setEstimate(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 4"
            min={0}
            step={0.5}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="issue-sprint" className="text-xs font-medium text-ads-text-subtle">
            Sprint
          </label>
          <SelectLike
            id="issue-sprint"
            value={sprintId ?? ''}
            onChange={(v) => setSprintId(v || undefined)}
            options={sprintOptions}
          />
        </div>

        <fieldset className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
          <legend className="text-xs font-medium text-ads-text-subtle">Labels</legend>
          <div className="flex flex-wrap gap-2">
            {(issue.labels ?? []).map((label) => (
              <button
                key={label.label.id}
                type="button"
                onClick={() => toggleLabel(label.label.id)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-ads-full px-2 py-1 text-xs font-medium transition-colors',
                  selectedLabels.includes(label.label.id)
                    ? 'bg-ads-accent-blue text-ads-text-inverse'
                    : 'bg-ads-bg-subtle text-ads-text hover:bg-ads-bg-muted',
                )}
                style={{ borderColor: label.label.color, borderWidth: '1px', borderStyle: 'solid' }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: label.label.color }}
                />
                {label.label.name}
              </button>
            ))}
            {(issue.labels ?? []).length === 0 && (
              <span className="text-xs text-ads-text-subtlest">No labels available</span>
            )}
          </div>
        </fieldset>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" onClick={save} loading={saving}>
          Save
        </Button>
        <Button onClick={() => router.back()}>Back</Button>
        <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} loading={deleting}>
          Delete
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="mb-2 text-sm font-semibold text-ads-text">Comments</h3>
        <div className="space-y-3">
          {(issue.comments ?? []).map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              isEditing={editingCommentId === c.id}
              editText={editingCommentText}
              onEditClick={() => {
                setEditingCommentId(c.id)
                setEditingCommentText(c.body)
              }}
              onSaveClick={() => updateComment(c.id)}
              onCancelClick={() => {
                setEditingCommentId(null)
                setEditingCommentText('')
              }}
              onDeleteClick={() => deleteComment(c.id)}
              onEditTextChange={setEditingCommentText}
              projectMembers={projectMembers}
            />
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1"
            placeholder="Add a comment..."
            rows={2}
          />
          <Button variant="primary" onClick={addComment} disabled={!comment.trim()}>
            Comment
          </Button>
        </div>
      </div>

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete issue"
      >
        <p className="text-ads-text">
          Are you sure you want to delete{' '}
          <strong>
            {issue.key}: {issue.title}
          </strong>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="default" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default IssueDetail
