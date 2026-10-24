import type { Issue as PrismaIssue, Sprint as PrismaSprint } from '@/generated/prisma'

export type Issue = PrismaIssue & {
  assignee?: { id: string; name?: string | null } | null
  labels?: Array<{ label: { id: string; name: string; color: string } }>
  sprint?: {
    name: string
    endDate: Date | string | null
    id: string
    status: string
    projectId: string
    createdAt: Date
    updatedAt: Date
    goal: string | null
    startDate: Date | null
  } | null
}

export type Sprint = PrismaSprint & {
  issues: Issue[]
  _count?: { issues: number }
}
