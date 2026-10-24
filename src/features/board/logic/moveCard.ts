export function moveCard<T extends { id: string; status: string; position: number }>(
  issues: T[],
  issueId: string,
  newStatus: string,
): T[] {
  return issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
}

export function moveCardPosition<T extends { id: string; status: string; position: number }>(
  issues: T[],
  issueId: string,
  newStatus: string,
  newPosition: number,
): T[] {
  const issueIndex = issues.findIndex((i) => i.id === issueId)
  if (issueIndex === -1) return issues

  const issue = issues[issueIndex]
  if (!issue) return issues
  const oldStatus = issue.status
  const oldPosition = issue.position

  // Remove the issue from its current position
  const withoutIssue = issues.filter((i) => i.id !== issueId)

  // Shift positions in the old status
  const shiftedOld = withoutIssue.map((i) =>
    i.status === oldStatus && i.position > oldPosition ? { ...i, position: i.position - 1 } : i,
  )

  // Shift positions in the new status
  const shiftedNew = shiftedOld.map((i) =>
    i.status === newStatus && i.position >= newPosition ? { ...i, position: i.position + 1 } : i,
  )

  // Insert the issue at the new position
  const movedIssue = { ...issue, status: newStatus, position: newPosition }
  const result = [...shiftedNew, movedIssue]
  // Sort by status and position to maintain order
  return result.sort((a, b) => {
    if (a.status !== b.status) return a.status.localeCompare(b.status)
    return a.position - b.position
  })
}

export function reorderWithinColumn<T extends { id: string; status: string; position: number }>(
  issues: T[],
  issueId: string,
  newPosition: number,
): T[] {
  const issueIndex = issues.findIndex((i) => i.id === issueId)
  if (issueIndex === -1) return issues

  const issue = issues[issueIndex]
  if (!issue) return issues
  const oldPosition = issue.position
  const status = issue.status

  if (oldPosition === newPosition) return issues

  const withoutIssue = issues.filter((i) => i.id !== issueId)

  const shifted = withoutIssue.map((i) => {
    if (i.status !== status) return i
    if (oldPosition < newPosition) {
      // Moving down: shift items between old and new position up
      if (i.position > oldPosition && i.position <= newPosition) {
        return { ...i, position: i.position - 1 }
      }
    } else {
      // Moving up: shift items between new and old position down
      if (i.position >= newPosition && i.position < oldPosition) {
        return { ...i, position: i.position + 1 }
      }
    }
    return i
  })

  const movedIssue = { ...issue, position: newPosition }
  const result = [...shifted, movedIssue]
  // Sort by status and position to maintain order
  return result.sort((a, b) => {
    if (a.status !== b.status) return a.status.localeCompare(b.status)
    return a.position - b.position
  })
}

export function groupByStatus<T extends { status: string; position: number }>(issues: T[]) {
  const groups: Record<string, T[]> = {}
  for (const i of issues) {
    if (!groups[i.status]) groups[i.status] = []
    groups[i.status]?.push(i)
  }
  // Sort each group by position
  for (const key of Object.keys(groups)) {
    const group = groups[key]
    if (group) {
      group.sort((a, b) => a.position - b.position)
    }
  }
  return groups
}

export interface ColumnConfig {
  id: string
  status: string
  label: string
  wipLimit?: number
  position: number
}

export function reorderColumns(
  columns: ColumnConfig[],
  fromIndex: number,
  toIndex: number,
): ColumnConfig[] {
  const result = [...columns]
  const removed = result.splice(fromIndex, 1)[0]
  if (!removed) return columns
  result.splice(toIndex, 0, removed)
  return result.map((col, index) => ({ ...col, position: index }))
}
