import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const createProjectSchema = z.object({
  workspaceSlug: z.string(),
  key: z.string().min(1).max(10),
  name: z.string().min(1),
  type: z.enum(['kanban', 'scrum']).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const data = {
    workspaceSlug: form?.get('workspaceSlug')?.toString() ?? '',
    key: form?.get('key')?.toString() ?? '',
    name: form?.get('name')?.toString() ?? '',
    type: form?.get('type')?.toString() ?? 'kanban',
  }
  const parsed = createProjectSchema.safeParse(data)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const ws = await prisma.workspace.findUnique({ where: { slug: parsed.data.workspaceSlug } })
  if (!ws) return NextResponse.json({ error: 'workspace not found' }, { status: 404 })

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: ws.id, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const existingProject = await prisma.project.findUnique({
    where: { workspaceId_key: { workspaceId: ws.id, key: parsed.data.key.toUpperCase() } },
  })
  if (existingProject)
    return NextResponse.json({ error: 'project key already exists' }, { status: 409 })

  const project = await prisma.project.create({
    data: {
      key: parsed.data.key.toUpperCase(),
      name: parsed.data.name,
      type: parsed.data.type,
      workspaceId: ws.id,
      leadId: userId,
    },
  })
  return NextResponse.redirect(new URL(`/w/${parsed.data.workspaceSlug}/p/${project.key}`, req.url))
}
