import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const schema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } })
  if (!project) return NextResponse.json({ error: 'project not found' }, { status: 404 })

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // Avoid key collisions (e.g. after deletions) by checking existence.
  let count = await prisma.issue.count({ where: { projectId: project.id } })
  let key = `${project.key}-${count + 1}`
  while (
    await prisma.issue.findUnique({ where: { projectId_key: { projectId: project.id, key } } })
  ) {
    count++
    key = `${project.key}-${count + 1}`
  }
  const issue = await prisma.issue.create({
    data: {
      key,
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type ?? 'task',
      priority: parsed.data.priority ?? 'medium',
      status: 'todo',
      projectId: project.id,
      reporterId: userId,
    },
    include: { assignee: true, labels: { include: { label: true } } },
  })
  return NextResponse.json(issue)
}
