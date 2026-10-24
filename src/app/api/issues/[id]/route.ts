import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'highest']).optional(),
  type: z.enum(['task', 'story', 'bug', 'epic']).optional(),
  assigneeId: z.string().nullable().optional(),
  estimate: z.number().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  position: z.number().int().optional(),
  labels: z.array(z.string()).optional(),
})

async function authorize(userId: string, issueId: string) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { project: { include: { workspace: true } } },
  })
  if (!issue) return { issue: null, allowed: false }
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: issue.project.workspaceId, userId } },
  })
  return { issue, allowed: !!membership }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const { issue, allowed } = await authorize(userId, id)
  if (!issue) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const data = parsed.data
  const newStatus = data.status ?? issue.status
  // When only status changes (no explicit position), append to end of new column.
  let newPosition = data.position
  if (newPosition === undefined) {
    if (newStatus !== issue.status) {
      const agg = await prisma.issue.aggregate({
        where: { projectId: issue.projectId, status: newStatus, id: { not: id } },
        _max: { position: true },
      })
      newPosition = (agg._max.position ?? -1) + 1
    } else {
      newPosition = issue.position
    }
  }

  const statusChanged = newStatus !== issue.status
  const positionChanged = newPosition !== issue.position

  // Recompute sibling positions when status or position changes.
  if (statusChanged || positionChanged) {
    const oldStatus = issue.status
    const oldPosition = issue.position
    const projectId = issue.projectId

    if (statusChanged) {
      // Old column: shift items after oldPosition up.
      await prisma.issue.updateMany({
        where: { projectId, status: oldStatus, position: { gt: oldPosition }, id: { not: id } },
        data: { position: { decrement: 1 } },
      })
      // New column: make room at newPosition.
      await prisma.issue.updateMany({
        where: { projectId, status: newStatus, position: { gte: newPosition }, id: { not: id } },
        data: { position: { increment: 1 } },
      })
    } else {
      // Same column reorder.
      if (newPosition > oldPosition) {
        await prisma.issue.updateMany({
          where: {
            projectId,
            status: oldStatus,
            position: { gt: oldPosition, lte: newPosition },
            id: { not: id },
          },
          data: { position: { decrement: 1 } },
        })
      } else if (newPosition < oldPosition) {
        await prisma.issue.updateMany({
          where: {
            projectId,
            status: oldStatus,
            position: { gte: newPosition, lt: oldPosition },
            id: { not: id },
          },
          data: { position: { increment: 1 } },
        })
      }
    }
  }

  const { labels, status: _status, position: _position, ...rest } = data

  const issueUpdated = await prisma.issue.update({
    where: { id },
    data: {
      ...rest,
      status: newStatus,
      position: newPosition,
      ...(labels !== undefined
        ? {
            labels: {
              deleteMany: {},
              create: labels.map((labelId) => ({ labelId })),
            },
          }
        : undefined),
    },
    include: { assignee: true, labels: { include: { label: true } }, sprint: true },
  })

  return NextResponse.json(issueUpdated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const { issue, allowed } = await authorize(userId, id)
  if (!issue) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  await prisma.issue.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
