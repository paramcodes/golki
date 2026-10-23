import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const schema = z.object({ name: z.string().min(1) })

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const form = await req.formData().catch(() => null)
  const name = form?.get('name')?.toString() || (await req.json().catch(() => ({}))).name
  const parsed = schema.safeParse({ name })
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const slug =
    parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Date.now().toString(36)
  const ws = await prisma.workspace.create({ data: { name: parsed.data.name, slug } })
  await prisma.workspaceMember.create({ data: { workspaceId: ws.id, userId, role: 'admin' } })
  return NextResponse.redirect(new URL('/workspaces', req.url))
}
