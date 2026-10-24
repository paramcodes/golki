import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const updateProjectSchema = z.object({
  key: z.string().min(1).max(10).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['kanban', 'scrum']).optional(),
  leadId: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      workspace: true,
      lead: true,
      issues: {
        include: {
          assignee: true,
          labels: { include: { label: true } },
          sprint: true,
        },
        orderBy: { position: 'asc' },
      },
      sprints: {
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
      },
    },
  })
  if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  return NextResponse.json(project)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { workspace: true },
  })
  if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
  })
  if (!membership || (membership.role !== 'admin' && project.leadId !== userId)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = updateProjectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  if (parsed.data.key) {
    const existingProject = await prisma.project.findUnique({
      where: {
        workspaceId_key: { workspaceId: project.workspaceId, key: parsed.data.key.toUpperCase() },
      },
    })
    if (existingProject && existingProject.id !== id) {
      return NextResponse.json({ error: 'project key already exists' }, { status: 409 })
    }
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      key: parsed.data.key?.toUpperCase(),
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type,
      leadId: parsed.data.leadId,
    },
    include: { workspace: true, lead: true },
  })

  return NextResponse.json({ project: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { workspace: true },
  })
  if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
  })
  if (membership?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
