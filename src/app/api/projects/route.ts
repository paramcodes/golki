import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const schema = z.object({
  workspaceSlug: z.string(),
  key: z.string().min(1).max(10),
  name: z.string().min(1),
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
  }
  const parsed = schema.safeParse(data)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const ws = await prisma.workspace.findUnique({ where: { slug: parsed.data.workspaceSlug } })
  if (!ws) return NextResponse.json({ error: 'workspace not found' }, { status: 404 })
  const project = await prisma.project.create({
    data: {
      key: parsed.data.key.toUpperCase(),
      name: parsed.data.name,
      workspaceId: ws.id,
      leadId: userId,
      type: 'kanban',
    },
  })
  return NextResponse.redirect(new URL(`/w/${parsed.data.workspaceSlug}/p/${project.key}`, req.url))
}
