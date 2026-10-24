'use client'
import { useState } from 'react'
import { Button, Input, Modal, Textarea } from '@/shared/ui'

type IssueFormProps = {
  open: boolean
  onClose: () => void
  onSubmit: (data: IssueFormData) => Promise<void>
  issueTypes: string[]
  priorities: string[]
  assignees: { id: string; name: string | null }[]
  labels: { id: string; name: string; color: string }[]
  loading?: boolean
}

export type IssueFormData = {
  title: string
  description: string
  type: string
  priority: string
  assigneeId?: string
  labels: string[]
  estimate?: number
}

export function IssueForm({
  open,
  onClose,
  onSubmit,
  issueTypes,
  priorities,
  assignees,
  labels,
  loading,
}: IssueFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState(issueTypes[0] ?? 'task')
  const [priority, setPriority] = useState('medium')
  const [assigneeIdValue, setAssigneeIdValue] = useState<string | undefined>()
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [estimate, setEstimate] = useState<number | undefined>()
  const [errors, setErrors] = useState<Partial<Record<keyof IssueFormData, string>>>({})

  const typeId = 'issue-type-select'
  const priorityId = 'issue-priority-select'
  const assigneeSelectId = 'issue-assignee-select'

  function validate() {
    const newErrors: Partial<Record<keyof IssueFormData, string>> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      assigneeId: assigneeIdValue,
      labels: selectedLabels,
      estimate,
    })
  }

  function toggleLabel(labelId: string) {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId],
    )
  }

  const selectClassName =
    'h-8 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm text-ads-text focus:border-ads-border-focused focus:outline-none'

  return (
    <Modal open={open} onClose={onClose} title="Create issue" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="What needs to be done?"
          autoFocus
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details, context, or steps to reproduce"
          rows={4}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={typeId} className="text-xs font-medium text-ads-text-subtle">
              Issue type
            </label>
            <select
              id={typeId}
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={selectClassName}
            >
              {issueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={priorityId} className="text-xs font-medium text-ads-text-subtle">
              Priority
            </label>
            <select
              id={priorityId}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={selectClassName}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={assigneeSelectId} className="text-xs font-medium text-ads-text-subtle">
              Assignee
            </label>
            <select
              id={assigneeSelectId}
              value={assigneeIdValue ?? ''}
              onChange={(e) => setAssigneeIdValue(e.target.value || undefined)}
              className={selectClassName}
            >
              <option value="">Unassigned</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name ?? 'Unknown'}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Estimate (hours)"
            type="number"
            value={estimate?.toString() ?? ''}
            onChange={(e) => setEstimate(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 4"
            min={0}
            step={0.5}
          />
        </div>

        <fieldset>
          <legend className="text-xs font-medium text-ads-text-subtle">Labels</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {labels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.id)}
                className={`
                  inline-flex items-center gap-1 rounded-ads-full px-2 py-1 text-xs font-medium transition-colors
                  ${
                    selectedLabels.includes(label.id)
                      ? 'bg-ads-accent-blue text-ads-text-inverse'
                      : 'bg-ads-bg-subtle text-ads-text hover:bg-ads-bg-muted'
                  }
                `}
                style={{ borderColor: label.color, borderWidth: '1px', borderStyle: 'solid' }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: label.color }} />
                {label.name}
              </button>
            ))}
            {labels.length === 0 && (
              <span className="text-xs text-ads-text-subtlest">No labels available</span>
            )}
          </div>
        </fieldset>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default IssueForm
