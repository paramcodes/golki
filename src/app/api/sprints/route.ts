import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const schema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  goal: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const sprints = await prisma.sprint.findMany({
    where: { projectId },
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
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(sprints)
}

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } })
  if (!project) return NextResponse.json({ error: 'project not found' }, { status: 404 })

  // Check membership
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId: project.workspaceId, userId },
  })
  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // Count sprints for naming (e.g., Sprint 1, Sprint 2)
  await prisma.sprint.count({ where: { projectId: project.id } })
  const sprint = await prisma.sprint.create({
    data: {
      name: parsed.data.name,
      goal: parsed.data.goal,
      projectId: project.id,
    },
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

  return NextResponse.json(sprint)
}
