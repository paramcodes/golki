import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const schema = z.object({
  name: z.string().min(1).optional(),
  goal: z.string().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  status: z.enum(['planned', 'active', 'completed']).optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      project: true,
      issues: {
        include: {
          assignee: true,
          labels: { include: { label: true } },
          sprint: true,
        },
        orderBy: { position: 'asc' },
      },
      _count: { select: { issues: true } },
    },
  })

  if (!sprint) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Check membership
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId: sprint.project.workspaceId, userId },
  })
  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  return NextResponse.json(sprint)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: { project: true },
  })
  if (!sprint) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Check membership
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId: sprint.project.workspaceId, userId },
  })
  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const data = parsed.data
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.goal !== undefined) updateData.goal = data.goal
  if (data.startDate !== undefined)
    updateData.startDate = data.startDate ? new Date(data.startDate) : null
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
  if (data.status !== undefined) updateData.status = data.status

  // Set startDate when starting sprint
  if (data.status === 'active' && sprint.status === 'planned') {
    updateData.startDate = new Date()
  }

  // Set endDate when completing sprint
  if (data.status === 'completed' && sprint.status === 'active') {
    updateData.endDate = new Date()
  }

  const updated = await prisma.sprint.update({
    where: { id },
    data: updateData,
    include: {
      issues: {
        include: {
          assignee: true,
          labels: { include: { label: true } },
          sprint: true,
        },
        orderBy: { position: 'asc' },
      },
      _count: { select: { issues: true } },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: { project: true },
  })
  if (!sprint) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Check membership
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId: sprint.project.workspaceId, userId },
  })
  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // Only allow deleting planned sprints
  if (sprint.status !== 'planned') {
    return NextResponse.json({ error: 'can only delete planned sprints' }, { status: 400 })
  }

  await prisma.sprint.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
