'use client'

import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Avatar, Button, Input, Lozenge, Modal } from '@/shared/ui'
import type { Issue, Sprint } from './types'

interface SprintPanelProps {
  sprint: Sprint
  onCreateSprint: (name: string, goal?: string) => Promise<void>
  onStartSprint: (sprintId: string) => Promise<void>
  onCompleteSprint: (sprintId: string) => Promise<void>
  onUpdateSprintGoal: (sprintId: string, goal: string) => Promise<void>
  onMoveIssueToSprint: (issueId: string, sprintId: string | null, position: number) => Promise<void>
  onReorderInSprint: (issueId: string, newPosition: number) => Promise<void>
  onOpenIssue: (id: string) => void
  isCreating?: boolean
}

function IssueCard({
  issue,
  onOpen,
  isDragging,
}: {
  issue: Issue
  onOpen: (id: string) => void
  isDragging?: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return draggable({
      element: el,
      getInitialData: () => ({ issueId: issue.id, type: 'issue' }),
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
        isDragging && 'opacity-50',
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-ads-text-subtlest">{issue.key}</span>
        <span className="text-xs text-ads-text-subtle">{issue.priority}</span>
      </div>
      <p className="text-sm font-medium text-ads-text">{issue.title}</p>

      {issue.labels && issue.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {issue.labels.slice(0, 3).map(({ label }: { label: { name: string; color: string } }) => (
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

export function SprintPanel({
  sprint,
  onCreateSprint,
  onStartSprint,
  onCompleteSprint,
  onUpdateSprintGoal,
  onMoveIssueToSprint,
  onReorderInSprint,
  onOpenIssue,
  isCreating,
}: SprintPanelProps) {
  const [showCreateSprint, setShowCreateSprint] = useState(false)
  const [newSprintName, setNewSprintName] = useState('')
  const [newSprintGoal, setNewSprintGoal] = useState('')
  const [creatingSprint, setCreatingSprint] = useState(false)
  const [editingGoal, setEditingGoal] = useState(false)
  const [editGoal, setEditGoal] = useState(sprint.goal ?? '')
  const [savingGoal, setSavingGoal] = useState(false)
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle drag and drop for issues within sprint
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    return dropTargetForElements({
      element: el,
      onDragEnter: ({ source }) => {
        const data = source.data as { issueId?: string; type?: string }
        if (data?.type === 'issue' && data.issueId) {
          setDraggedIssueId(data.issueId)
        }
      },
      onDragLeave: () => {
        setDraggedIssueId(null)
      },
      onDrop: ({ source, location }) => {
        const data = source.data as { issueId?: string; type?: string; sprintId?: string }
        if (!data?.issueId || data.type !== 'issue') return

        const rect = el.getBoundingClientRect()
        const clientY = location.current.input.clientY
        const relativeY = clientY - rect.top
        const itemHeight = 100
        const newPosition = Math.floor(relativeY / itemHeight)
        const clampedPosition = Math.max(0, Math.min(newPosition, sprint.issues.length))

        if (data.sprintId === sprint.id) {
          onReorderInSprint(data.issueId, clampedPosition)
        } else {
          onMoveIssueToSprint(data.issueId, sprint.id, clampedPosition)
        }
        setDraggedIssueId(null)
      },
    })
  }, [sprint.id, sprint.issues.length, onMoveIssueToSprint, onReorderInSprint])

  // Handle drag from backlog into sprint
  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const data = source.data as { issueId?: string; type?: string; sprintId?: string }
        if (!data?.issueId || data.type !== 'issue') return

        if (data.sprintId === sprint.id) return // Already in this sprint

        const el = containerRef.current
        if (!el) return

        const rect = el.getBoundingClientRect()
        if (
          location.current.input.clientX < rect.left ||
          location.current.input.clientX > rect.right ||
          location.current.input.clientY < rect.top ||
          location.current.input.clientY > rect.bottom
        ) {
          return
        }

        const clientY = location.current.input.clientY
        const relativeY = clientY - rect.top
        const itemHeight = 100
        const newPosition = Math.floor(relativeY / itemHeight)
        const clampedPosition = Math.max(0, Math.min(newPosition, sprint.issues.length))

        onMoveIssueToSprint(data.issueId, sprint.id, clampedPosition)
      },
    })
  }, [sprint.id, sprint.issues.length, onMoveIssueToSprint])

  const sprintIssues = sprint.issues

  const handleCreateSprint = async () => {
    if (!newSprintName.trim()) return
    setCreatingSprint(true)
    await onCreateSprint(newSprintName.trim(), newSprintGoal.trim() || undefined)
    setCreatingSprint(false)
    setNewSprintName('')
    setNewSprintGoal('')
    setShowCreateSprint(false)
  }

  const handleStartSprint = async () => {
    if (sprintIssues.length === 0) {
      if (!confirm('Start sprint with no issues?')) return
    }
    await onStartSprint(sprint.id)
  }

  const handleCompleteSprint = async () => {
    if (!confirm('Complete this sprint?')) return
    await onCompleteSprint(sprint.id)
  }

  const handleSaveGoal = async () => {
    setSavingGoal(true)
    await onUpdateSprintGoal(sprint.id, editGoal.trim())
    setSavingGoal(false)
    setEditingGoal(false)
  }

  const statusColor: Record<string, string> = {
    planned: 'bg-ads-bg-subtle text-ads-text-subtle',
    active: 'bg-ads-accent-green/10 text-ads-accent-green',
    completed: 'bg-ads-bg-subtle text-ads-text-subtle',
  }
  const statusClass = statusColor[sprint.status] ?? 'bg-ads-bg-subtle text-ads-text-subtle'

  return (
    <div className="flex flex-col w-80 shrink-0 rounded-ads-lg bg-ads-bg-subtle p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-ads-text">{sprint.name}</h2>
          <span className={cn('rounded-ads-full px-2 py-0.5 text-xs', statusClass)}>
            {sprint.status}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded-ads-full bg-ads-bg px-2 py-0.5 text-xs text-ads-text-subtle">
            {sprintIssues.length} issues
          </span>
          {sprint.status === 'planned' && (
            <>
              <Button size="sm" variant="primary" onClick={handleStartSprint}>
                Start
              </Button>
              <Button size="sm" variant="default" onClick={() => setShowCreateSprint(true)}>
                Edit
              </Button>
            </>
          )}
          {sprint.status === 'active' && (
            <Button size="sm" variant="danger" onClick={handleCompleteSprint}>
              Complete
            </Button>
          )}
        </div>
      </div>

      {sprint.goal && (
        <div className="mb-3 rounded-ads-md bg-ads-bg p-2 text-sm text-ads-text-subtle">
          {editingGoal ? (
            <div className="flex gap-2">
              <Input
                value={editGoal}
                onChange={(e) => setEditGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                onBlur={handleSaveGoal}
                autoFocus
                className="flex-1"
                placeholder="Sprint goal"
              />
              <Button size="sm" variant="primary" onClick={handleSaveGoal} loading={savingGoal}>
                Save
              </Button>
              <Button size="sm" variant="default" onClick={() => setEditingGoal(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span>{sprint.goal}</span>
              <Button size="sm" variant="subtle" onClick={() => setEditingGoal(true)}>
                ✎
              </Button>
            </div>
          )}
        </div>
      )}

      {!sprint.goal && sprint.status === 'planned' && (
        <Button
          size="sm"
          variant="subtle"
          className="mb-3 w-full"
          onClick={() => setEditingGoal(true)}
        >
          + Add sprint goal
        </Button>
      )}

      {sprint.status === 'planned' && sprintIssues.length === 0 && (
        <div className="mb-3 rounded-ads-md bg-ads-bg-danger/10 p-2 text-xs text-ads-accent-red">
          ⚠ Empty sprint — add issues before starting
        </div>
      )}

      <div ref={containerRef} className="flex flex-1 flex-col gap-2 min-h-[200px] overflow-y-auto">
        {sprintIssues.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-center text-ads-text-subtlest p-4">
            <p>Drag issues here from backlog</p>
            <p className="text-[11px]">or create new ones</p>
          </div>
        ) : (
          sprintIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onOpen={onOpenIssue}
              isDragging={draggedIssueId === issue.id}
            />
          ))
        )}
      </div>

      {isCreating && (
        <Modal
          open={showCreateSprint}
          onClose={() => setShowCreateSprint(false)}
          title="Create Sprint"
          size="sm"
          footer={
            <>
              <Button onClick={() => setShowCreateSprint(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateSprint} loading={creatingSprint}>
                Create
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input
              label="Sprint name"
              value={newSprintName}
              onChange={(e) => setNewSprintName(e.target.value)}
              placeholder="e.g., Sprint 1"
              autoFocus
            />
            <Input
              label="Sprint goal (optional)"
              value={newSprintGoal}
              onChange={(e) => setNewSprintGoal(e.target.value)}
              placeholder="What do we want to achieve?"
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
