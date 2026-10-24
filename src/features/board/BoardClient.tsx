'use client'

import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import type { Issue as PrismaIssue } from '@/generated/prisma'
import { Button, Input, Modal } from '@/shared/ui'
import { Column } from './Column'
import { type BoardFilters, FilterBar } from './FilterBar'
import {
  type ColumnConfig,
  groupByStatus,
  moveCardPosition,
  reorderColumns,
} from './logic/moveCard'

type Issue = PrismaIssue & {
  assignee?: { id: string; name?: string | null } | null
  labels?: Array<{ label: { id: string; name: string; color: string } }>
  sprint?: { name: string; endDate: Date | string } | null
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'col-todo', status: 'todo', label: 'To Do', position: 0 },
  { id: 'col-in_progress', status: 'in_progress', label: 'In Progress', position: 0 },
  { id: 'col-in_review', status: 'in_review', label: 'In Review', position: 0 },
  { id: 'col-done', status: 'done', label: 'Done', position: 0 },
]

const STORAGE_KEY = 'golki-board-columns'

function loadColumns(projectId: string): ColumnConfig[] {
  if (typeof window === 'undefined') return DEFAULT_COLUMNS
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${projectId}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_COLUMNS
}

function saveColumns(projectId: string, columns: ColumnConfig[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${STORAGE_KEY}-${projectId}`, JSON.stringify(columns))
  } catch {
    // Ignore write errors
  }
}

export function BoardClient({
  project,
}: {
  project: { id: string; key: string; name: string; issues: Issue[] }
}) {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>(project.issues)
  const [columns, setColumns] = useState<ColumnConfig[]>(() => loadColumns(project.id))
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingColumns, setEditingColumns] = useState(false)
  const [filters, setFilters] = useState<BoardFilters>({
    assigneeIds: [],
    types: [],
    priorities: [],
    labelIds: [],
    text: '',
  })

  // Save columns when they change
  useEffect(() => {
    saveColumns(project.id, columns)
  }, [columns, project.id])

  // Filter issues based on active filters
  const filteredIssues = issues.filter((issue) => {
    if (filters.assigneeIds.length > 0) {
      const assigneeId = issue.assignee?.id
      if (!assigneeId || !filters.assigneeIds.includes(assigneeId)) return false
    }
    if (filters.types.length > 0 && !filters.types.includes(issue.type)) return false
    if (filters.priorities.length > 0 && !filters.priorities.includes(issue.priority)) return false
    if (filters.labelIds.length > 0) {
      const issueLabelIds = issue.labels?.map((l) => l.label.id) ?? []
      if (!filters.labelIds.some((id) => issueLabelIds.includes(id))) return false
    }
    if (filters.text) {
      const searchText = filters.text.toLowerCase()
      const titleMatch = issue.title.toLowerCase().includes(searchText)
      const keyMatch = issue.key.toLowerCase().includes(searchText)
      if (!titleMatch && !keyMatch) return false
    }
    return true
  })

  const moveIssue = useCallback(async (issueId: string, newStatus: string, newPosition: number) => {
    setIssues((prev) => moveCardPosition(prev, issueId, newStatus, newPosition))
    await fetch(`/api/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, position: newPosition }),
    })
  }, [])

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    setColumns((prev) => reorderColumns(prev, fromIndex, toIndex))
  }, [])

  const handleUpdateColumn = useCallback((column: ColumnConfig) => {
    setColumns((prev) => prev.map((c) => (c.id === column.id ? column : c)))
  }, [])

  const handleDeleteColumn = useCallback((columnId: string) => {
    setColumns((prev) => {
      const columnToDelete = prev.find((c) => c.id === columnId)
      if (!columnToDelete) return prev

      // Move issues from deleted column to first remaining column
      const firstColumn = prev.find((c) => c.id !== columnId)
      if (firstColumn) {
        setIssues((issues) =>
          issues.map((i) =>
            i.status === columnToDelete.status
              ? { ...i, status: firstColumn.status, position: 0 }
              : i,
          ),
        )
      }

      return prev.filter((c) => c.id !== columnId)
    })
  }, [])

  const handleAddColumn = useCallback(
    (status: string, label: string) => {
      const newColumn: ColumnConfig = {
        id: `col-${status}`,
        status,
        label,
        position: columns.length,
      }
      setColumns((prev) => [...prev, newColumn])
    },
    [columns.length],
  )

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

  // Handle drag and drop for column reordering
  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop: ({ source, location }) => {
        const data = source.data as { columnId?: string; type?: string }
        if (data?.type === 'column' && data.columnId && location.current.dropTargets.length > 0) {
          const target = location.current.dropTargets[0]
          const targetData = target?.data as { columnId?: string; type?: string } | undefined
          if (
            targetData?.type === 'column' &&
            targetData.columnId &&
            targetData.columnId !== data.columnId
          ) {
            const fromIndex = columns.findIndex((c) => c.id === data.columnId)
            const toIndex = columns.findIndex((c) => c.id === targetData.columnId)
            if (fromIndex !== -1 && toIndex !== -1) {
              handleColumnReorder(fromIndex, toIndex)
            }
          }
        }
      },
    })
    return cleanup
  }, [columns, handleColumnReorder])

  // Group issues by status using the logic function
  const groupedIssues = groupByStatus(filteredIssues)

  // Ensure all columns have issues array (even empty)
  const columnsWithIssues = columns.map((col) => ({
    ...col,
    issues: groupedIssues[col.status] ?? [],
  }))

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ads-border px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">
            {project.key} {project.name}
          </h1>
          <p className="text-sm text-ads-text-subtle">Board</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={editingColumns ? 'primary' : 'default'}
            onClick={() => setEditingColumns((prev) => !prev)}
            size="sm"
          >
            {editingColumns ? 'Done' : 'Edit columns'}
          </Button>
          <Button variant="primary" onClick={() => setCreating(true)} size="sm">
            Create issue
          </Button>
        </div>
      </div>

      <FilterBar issues={issues} onFilterChange={setFilters} initialFilters={filters} />

      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {columnsWithIssues.map((col) => (
          <Column
            key={col.id}
            column={col}
            issues={col.issues}
            onDropIssue={moveIssue}
            onOpen={(id) => router.push(`/issue/${id}`)}
            onUpdateColumn={handleUpdateColumn}
            onDeleteColumn={handleDeleteColumn}
            onAddColumn={handleAddColumn}
            isEditing={editingColumns}
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
