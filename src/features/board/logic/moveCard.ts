export function moveCard<T extends { id: string; status: string }>(
  issues: T[],
  issueId: string,
  newStatus: string,
): T[] {
  return issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
}
export function groupByStatus<T extends { status: string }>(issues: T[]) {
  const groups: Record<string, T[]> = {}
  for (const i of issues) {
    if (!groups[i.status]) groups[i.status] = []
    groups[i.status]?.push(i)
  }
  return groups
}
