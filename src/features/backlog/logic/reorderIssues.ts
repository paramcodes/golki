export interface IssueLike {
  id: string
  position: number
  sprintId?: string | null
}

export function reorderIssues<T extends IssueLike>(
  issues: T[],
  issueId: string,
  newPosition: number,
): T[] {
  const issueIndex = issues.findIndex((i) => i.id === issueId)
  if (issueIndex === -1) return issues

  const issue = issues[issueIndex]
  if (!issue) return issues
  const oldPosition = issue.position

  if (oldPosition === newPosition) return issues

  const withoutIssue = issues.filter((i) => i.id !== issueId)

  const shifted = withoutIssue.map((i) => {
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
  return result.sort((a, b) => a.position - b.position)
}

export function moveIssueToSprint<T extends IssueLike>(
  issues: T[],
  issueId: string,
  targetSprintId: string | null,
  targetPosition: number,
): T[] {
  const issueIndex = issues.findIndex((i) => i.id === issueId)
  if (issueIndex === -1) return issues

  const issue = issues[issueIndex]
  if (!issue) return issues

  // Remove from current position
  const withoutIssue = issues.filter((i) => i.id !== issueId)

  // Shift positions in target sprint
  const shifted = withoutIssue.map((i) => {
    if (i.sprintId === targetSprintId && i.position >= targetPosition) {
      return { ...i, position: i.position + 1 }
    }
    return i
  })

  // If moving from a sprint, shift positions in old sprint down
  const oldSprintId = issue.sprintId
  if (oldSprintId && oldSprintId !== targetSprintId) {
    const shiftedOld = shifted.map((i) => {
      if (i.sprintId === oldSprintId && i.position > issue.position) {
        return { ...i, position: i.position - 1 }
      }
      return i
    })
    const movedIssue = { ...issue, sprintId: targetSprintId, position: targetPosition }
    const result = [...shiftedOld, movedIssue]
    return result.sort((a, b) => {
      if (a.sprintId !== b.sprintId) {
        // Issues without sprint (backlog) come first
        if (!a.sprintId && b.sprintId) return -1
        if (a.sprintId && !b.sprintId) return 1
        return String(a.sprintId).localeCompare(String(b.sprintId))
      }
      return a.position - b.position
    })
  }

  const movedIssue = { ...issue, sprintId: targetSprintId, position: targetPosition }
  const result = [...shifted, movedIssue]
  return result.sort((a, b) => {
    if (a.sprintId !== b.sprintId) {
      if (!a.sprintId && b.sprintId) return -1
      if (a.sprintId && !b.sprintId) return 1
      return String(a.sprintId).localeCompare(String(b.sprintId))
    }
    return a.position - b.position
  })
}
