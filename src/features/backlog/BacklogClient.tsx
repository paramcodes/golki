'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { BacklogList, type Issue, type Sprint, SprintPanel } from '@/features/backlog'
import { Button, Input, Modal } from '@/shared/ui'

interface BacklogClientProps {
  project: {
    id: string
    key: string
    name: string
    issues: Issue[]
    sprints: Sprint[]
  }
  workspaceSlug: string
}

export function BacklogClient({ project, workspaceSlug }: BacklogClientProps) {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>(project.issues)
  const [sprints, setSprints] = useState<Sprint[]>(project.sprints)
  const [creatingSprint, setCreatingSprint] = useState(false)
  const [newSprintName, setNewSprintName] = useState('')
  const [newSprintGoal, setNewSprintGoal] = useState('')

  const fetchSprints = useCallback(async () => {
    const res = await fetch(`/api/sprints?projectId=${project.id}`)
    if (res.ok) {
      const data = await res.json()
      setSprints(data)
    }
  }, [project.id])

  const handleReorder = useCallback(
    async (issueId: string, newPosition: number) => {
      const issue = issues.find((i) => i.id === issueId)
      if (!issue) return

      // Optimistic update
      setIssues((prev) => {
        const backlogIssues = prev.filter((i) => !i.sprintId)
        const reordered = [...backlogIssues]
        const issueIndex = reordered.findIndex((i) => i.id === issueId)
        if (issueIndex === -1) return prev
        const moved = reordered.splice(issueIndex, 1)[0]
        if (!moved) return prev
        reordered.splice(newPosition, 0, moved)
        const updatedBacklog = reordered.map((i, idx) => ({ ...i, position: idx }))

        // Merge back with sprint issues
        const sprintIssues = prev.filter((i) => i.sprintId)
        return [...updatedBacklog, ...sprintIssues]
      })

      // Persist
      await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: newPosition }),
      })
    },
    [issues],
  )

  const handleMoveToSprint = useCallback(
    async (issueId: string, sprintId: string | null, position: number) => {
      const issue = issues.find((i) => i.id === issueId)
      if (!issue) return

      // Optimistic update
      setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, sprintId, position } : i)))

      // Persist
      await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sprintId, position }),
      })

      // Refetch sprints to update their issue lists
      await fetchSprints()
    },
    [issues, fetchSprints],
  )

  const handleOpenIssue = (id: string) => {
    router.push(`/issue/${id}`)
  }

  const handleCreateSprint = useCallback(
    async (name: string, goal?: string) => {
      const res = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, name, goal }),
      })
      if (res.ok) {
        await fetchSprints()
      }
    },
    [project.id, fetchSprints],
  )

  const handleStartSprint = useCallback(
    async (sprintId: string) => {
      await fetch(`/api/sprints/${sprintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })
      await fetchSprints()
    },
    [fetchSprints],
  )

  const handleCompleteSprint = useCallback(
    async (sprintId: string) => {
      await fetch(`/api/sprints/${sprintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      await fetchSprints()
    },
    [fetchSprints],
  )

  const handleUpdateSprintGoal = useCallback(
    async (sprintId: string, goal: string) => {
      await fetch(`/api/sprints/${sprintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      })
      await fetchSprints()
    },
    [fetchSprints],
  )

  // Sort sprints by status (planned first, then active, then completed) and createdAt
  const sortedSprints = [...sprints].sort((a, b) => {
    const statusOrder: Record<string, number> = { planned: 0, active: 1, completed: 2 }
    const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3)
    if (statusDiff !== 0) return statusDiff
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{project.key} Backlog</h1>
        <Link href={`/w/${workspaceSlug}/p/${project.key}`} className="text-sm text-ads-text-link">
          Board
        </Link>
      </div>

      <div className="flex gap-4">
        {/* Backlog List */}
        <div className="flex-1 min-w-0">
          <BacklogList
            issues={issues}
            onReorder={handleReorder}
            onMoveToSprint={handleMoveToSprint}
            onOpenIssue={handleOpenIssue}
          />
        </div>

        {/* Sprint Panels */}
        <div className="flex flex-col gap-4 w-80 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ads-text">Sprints</h2>
            <Button size="sm" variant="primary" onClick={() => setCreatingSprint(true)}>
              Create Sprint
            </Button>
          </div>

          {sortedSprints.map((sprint) => (
            <SprintPanel
              key={sprint.id}
              sprint={sprint}
              onCreateSprint={handleCreateSprint}
              onStartSprint={handleStartSprint}
              onCompleteSprint={handleCompleteSprint}
              onUpdateSprintGoal={handleUpdateSprintGoal}
              onMoveIssueToSprint={handleMoveToSprint}
              onReorderInSprint={handleReorder}
              onOpenIssue={handleOpenIssue}
              isCreating={creatingSprint}
            />
          ))}

          {sortedSprints.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-center text-ads-text-subtlest p-8">
              <p>No sprints yet</p>
              <p className="text-sm">Create your first sprint to start planning</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={creatingSprint}
        onClose={() => {
          setCreatingSprint(false)
          setNewSprintName('')
          setNewSprintGoal('')
        }}
        title="Create Sprint"
        footer={
          <>
            <Button
              onClick={() => {
                setCreatingSprint(false)
                setNewSprintName('')
                setNewSprintGoal('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!newSprintName.trim()) return
                await handleCreateSprint(newSprintName.trim(), newSprintGoal.trim() || undefined)
                setCreatingSprint(false)
                setNewSprintName('')
                setNewSprintGoal('')
              }}
            >
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
    </div>
  )
}
