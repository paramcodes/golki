'use client'

import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Avatar, EmptyState, Lozenge } from '@/shared/ui'
import type { Issue } from './types'

interface BacklogListProps {
  issues: Issue[]
  onReorder: (issueId: string, newPosition: number) => Promise<void>
  onMoveToSprint: (issueId: string, sprintId: string | null, position: number) => Promise<void>
  onOpenIssue: (id: string) => void
}

function IssueCard({
  issue,
  onOpen,
  isDragging,
  isOverDropTarget,
}: {
  issue: Issue
  onOpen: (id: string) => void
  isDragging?: boolean
  isOverDropTarget?: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return draggable({
      element: el,
      getInitialData: () => ({ issueId: issue.id, type: 'issue', sprintId: issue.sprintId }),
    })
  }, [issue.id, issue.sprintId])

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
        isOverDropTarget && 'ring-2 ring-ads-accent-blue',
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
        {issue.sprint && (
          <span className="rounded-ads-full bg-ads-accent-blue/10 px-2 py-0.5 text-xs text-ads-accent-blue">
            {issue.sprint.name}
          </span>
        )}
      </div>
    </button>
  )
}

export function BacklogList({ issues, onReorder, onMoveToSprint, onOpenIssue }: BacklogListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null)

  // Filter to only backlog issues (no sprintId)
  const backlogIssues = issues.filter((i) => !i.sprintId)

  const virtualizer = useVirtualizer({
    count: backlogIssues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  })

  // Handle drop target for reordering within backlog
  useEffect(() => {
    const el = parentRef.current
    if (!el) return
    return dropTargetForElements({
      element: el,
      onDragEnter: ({ source }) => {
        const data = source.data as { issueId?: string; type?: string; sprintId?: string }
        if (data?.type === 'issue' && data.issueId && !data.sprintId) {
          setDraggedIssueId(data.issueId)
        }
      },
      onDragLeave: () => {
        setDraggedIssueId(null)
      },
      onDrop: ({ source, location }) => {
        const data = source.data as { issueId?: string; type?: string; sprintId?: string }
        if (!data?.issueId || data.type !== 'issue' || data.sprintId) return

        const rect = el.getBoundingClientRect()
        const clientY = location.current.input.clientY
        const relativeY = clientY - rect.top
        const scrollTop = el.scrollTop
        const newPosition = Math.floor((relativeY + scrollTop) / 120)
        const clampedPosition = Math.max(0, Math.min(newPosition, backlogIssues.length))

        onReorder(data.issueId, clampedPosition)
        setDraggedIssueId(null)
      },
    })
  }, [backlogIssues.length, onReorder])

  // Monitor for drops from sprints into backlog
  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const data = source.data as { issueId?: string; type?: string; sprintId?: string }
        if (!data?.issueId || data.type !== 'issue' || !data.sprintId) return

        const el = parentRef.current
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
        const scrollTop = el.scrollTop
        const newPosition = Math.floor((relativeY + scrollTop) / 120)
        const clampedPosition = Math.max(0, Math.min(newPosition, backlogIssues.length))

        onMoveToSprint(data.issueId, null, clampedPosition)
      },
    })
  }, [backlogIssues.length, onMoveToSprint])

  // Also monitor for drops onto sprint panels
  useEffect(() => {
    return monitorForElements({
      onDragStart: ({ source }) => {
        const data = source.data as { issueId?: string; type?: string; sprintId?: string }
        if (data?.type === 'issue' && data.issueId && !data.sprintId) {
          setDraggedIssueId(data.issueId)
        }
      },
      onDrop: () => {
        setDraggedIssueId(null)
      },
    })
  }, [])

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className="flex flex-col gap-2 h-[calc(100vh-300px)] overflow-y-auto rounded-ads-lg border border-ads-border bg-ads-bg-subtle p-2"
      style={{ minHeight: 400 }}
    >
      {backlogIssues.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center text-ads-text-subtlest p-8">
          <EmptyState title="Backlog is empty" description="Create issues to get started" />
        </div>
      ) : (
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const issue = backlogIssues[virtualRow.index]
            if (!issue) return null
            return (
              <div
                key={issue.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <IssueCard
                  issue={issue}
                  onOpen={onOpenIssue}
                  isDragging={draggedIssueId === issue.id}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
