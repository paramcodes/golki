'use client'

import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useRef, useState } from 'react'
import type { Issue as PrismaIssue } from '@/generated/prisma'
import { cn } from '@/shared/lib/cn'
import { Avatar, Button, EmptyState, Input, Lozenge, Modal } from '@/shared/ui'
import type { ColumnConfig } from './logic/moveCard'

type Issue = PrismaIssue & {
  assignee?: { name?: string | null } | null
  labels?: Array<{ label: { name: string; color: string } }>
  sprint?: { name: string; endDate: Date | string } | null
}

interface ColumnProps {
  column: ColumnConfig
  issues: Issue[]
  onDropIssue: (issueId: string, newStatus: string, newPosition: number) => void
  onOpen: (id: string) => void
  onUpdateColumn: (column: ColumnConfig) => void
  onDeleteColumn: (columnId: string) => void
  onAddColumn: (status: string, label: string) => void
  isEditing: boolean
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

  const dueDate = issue.sprint?.endDate ? new Date(issue.sprint.endDate).toLocaleDateString() : null

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => onOpen(issue.id)}
      className={cn(
        'w-full cursor-grab rounded-ads-md border border-ads-border bg-ads-bg p-3 text-left shadow-sm hover:shadow transition-shadow',
        'drag-active:shadow-lg drag-active:ring-2 drag-active:ring-ads-focus',
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-ads-text-subtlest">{issue.key}</span>
        <span className="text-xs text-ads-text-subtle">{issue.priority}</span>
      </div>
      <p className="text-sm font-medium text-ads-text">{issue.title}</p>

      {issue.labels && issue.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {issue.labels.slice(0, 3).map(({ label }) => (
            <Lozenge
              key={label.name}
              className="text-[10px]"
              style={{ backgroundColor: label.color, color: '#fff' }}
            >
              {label.name}
            </Lozenge>
          ))}
          {issue.labels.length > 3 && (
            <Lozenge appearance="default" className="text-[10px]">
              +{issue.labels.length - 3}
            </Lozenge>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-ads-text-subtlest">
        <div className="flex items-center gap-1.5">
          {issue.assignee ? <Avatar name={issue.assignee.name ?? undefined} size="xs" /> : null}
          <span>{issue.type}</span>
          {issue.estimate && (
            <span className="flex items-center gap-0.5">
              <span>⏱</span>
              <span>{issue.estimate}SP</span>
            </span>
          )}
        </div>
        {dueDate && (
          <span className="flex items-center gap-0.5 text-ads-accent-orange">
            <span>📅</span>
            <span>{dueDate}</span>
          </span>
        )}
      </div>
    </button>
  )
}

export function Column({
  column,
  issues,
  onDropIssue,
  onOpen,
  onUpdateColumn,
  onDeleteColumn,
  onAddColumn,
  isEditing,
}: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnLabel, setNewColumnLabel] = useState('')
  const [newColumnStatus, setNewColumnStatus] = useState('')
  const [editingColumn, setEditingColumn] = useState<ColumnConfig | null>(null)
  const [editLabel, setEditLabel] = useState('')

  // Column drop target
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return dropTargetForElements({
      element: el,
      onDrop: ({ source, location }) => {
        const id = (source.data as { issueId?: string }).issueId
        if (!id) return

        // Calculate position based on drop location
        const columnIssues = issues.filter((i) => i.status === column.status)
        const rect = el.getBoundingClientRect()
        const clientY = location.current.input.clientY
        const relativeY = clientY - rect.top
        const itemHeight = 100 // approximate card height
        const newPosition = Math.floor(relativeY / itemHeight)
        const clampedPosition = Math.max(0, Math.min(newPosition, columnIssues.length))

        onDropIssue(id, column.status, clampedPosition)
      },
    })
  }, [column.status, issues, onDropIssue])

  // Column header drag for reordering
  const headerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const draggableCleanup = draggable({
      element: el,
      getInitialData: () => ({ columnId: column.id, type: 'column' }),
    })
    const dropTargetCleanup = dropTargetForElements({
      element: el,
      onDrop: ({ source }) => {
        const data = source.data as { columnId?: string; type?: string }
        if (data?.type === 'column' && data.columnId && data.columnId !== column.id) {
          // Column reorder handled by parent
        }
      },
    })
    return () => {
      draggableCleanup()
      dropTargetCleanup()
    }
  }, [column.id])

  const handleRename = () => {
    if (editLabel.trim() && editingColumn) {
      onUpdateColumn({ ...editingColumn, label: editLabel.trim() })
    }
    setEditingColumn(null)
    setEditLabel('')
  }

  const handleDelete = () => {
    if (confirm(`Delete column "${column.label}"? Issues will move to the first column.`)) {
      onDeleteColumn(column.id)
    }
  }

  const handleAddColumn = () => {
    if (newColumnLabel.trim() && newColumnStatus.trim()) {
      onAddColumn(newColumnStatus.trim(), newColumnLabel.trim())
      setShowAddColumn(false)
      setNewColumnLabel('')
      setNewColumnStatus('')
    }
  }

  const isOverWipLimit = column.wipLimit && issues.length > column.wipLimit

  return (
    <div ref={ref} className="flex w-72 shrink-0 flex-col rounded-ads-lg bg-ads-bg-subtle p-2">
      <div ref={headerRef} className="mb-2 flex items-center justify-between px-1">
        {isEditing ? (
          <div className="flex w-full items-center gap-1">
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              onBlur={handleRename}
              autoFocus
              className="flex-1"
              placeholder="Column name"
            />
            <Button size="sm" variant="danger" onClick={handleDelete}>
              🗑
            </Button>
          </div>
        ) : (
          <>
            <span className="text-sm font-semibold text-ads-text">{column.label}</span>
            <div className="flex items-center gap-1">
              {column.wipLimit && (
                <span
                  className={cn(
                    'rounded-ads-full px-2 py-0.5 text-xs',
                    isOverWipLimit
                      ? 'bg-ads-bg-danger text-ads-accent-red font-semibold'
                      : 'bg-ads-bg text-ads-text-subtle',
                  )}
                >
                  {issues.length}/{column.wipLimit}
                </span>
              )}
              <span className="rounded-ads-full bg-ads-bg px-2 py-0.5 text-xs text-ads-text-subtle">
                {issues.length}
              </span>
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  setEditingColumn(column)
                  setEditLabel(column.label)
                }}
                className="text-ads-text-subtle hover:text-ads-text"
              >
                ✎
              </Button>
              <Button
                size="sm"
                variant="subtle"
                onClick={handleDelete}
                className="text-ads-text-subtle hover:text-ads-accent-red"
              >
                🗑
              </Button>
            </div>
          </>
        )}
      </div>

      {isOverWipLimit && (
        <div className="mb-2 rounded-ads-sm bg-ads-bg-danger/10 p-2 text-xs text-ads-accent-red">
          ⚠ WIP limit exceeded ({issues.length}/{column.wipLimit})
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 min-h-[200px]">
        {issues.length === 0 ? (
          <EmptyState title="No issues" />
        ) : (
          issues.map((issue) => <IssueCard key={issue.id} issue={issue} onOpen={onOpen} />)
        )}
      </div>

      {isEditing && (
        <Button variant="default" size="sm" className="mt-2" onClick={() => setShowAddColumn(true)}>
          + Add column
        </Button>
      )}

      {showAddColumn && (
        <Modal open onClose={() => setShowAddColumn(false)} title="Add Column" size="sm">
          <div className="space-y-3">
            <Input
              label="Column Key (status)"
              value={newColumnStatus}
              onChange={(e) =>
                setNewColumnStatus(e.target.value.toLowerCase().replace(/\s+/g, '_'))
              }
              placeholder="e.g., in_review"
              autoFocus
            />
            <Input
              label="Column Label"
              value={newColumnLabel}
              onChange={(e) => setNewColumnLabel(e.target.value)}
              placeholder="e.g., In Review"
            />
            <div className="flex justify-end gap-2">
              <Button variant="default" onClick={() => setShowAddColumn(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddColumn}>
                Add
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
