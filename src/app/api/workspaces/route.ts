import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const createWorkspaceSchema = z.object({ name: z.string().min(1) })
const inviteMemberSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email(),
})

export async function GET(_req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: { include: { projects: true } } },
  })

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role,
    projects: m.workspace.projects.map((p) => ({ id: p.id, key: p.key, name: p.name })),
  }))

  return NextResponse.json({ workspaces })
}

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const isInvite = form?.get('action') === 'invite'

  if (isInvite) {
    const workspaceId = form?.get('workspaceId')?.toString() ?? ''
    const email = form?.get('email')?.toString() ?? ''
    const parsed = inviteMemberSchema.safeParse({ workspaceId, email })
    if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: parsed.data.workspaceId, userId } },
    })
    if (membership?.role !== 'admin') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const invitedUser = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (!invitedUser) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 })
    }

    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId: parsed.data.workspaceId, userId: invitedUser.id },
      },
      create: { workspaceId: parsed.data.workspaceId, userId: invitedUser.id, role: 'member' },
      update: { role: 'member' },
    })

    return NextResponse.redirect(new URL('/workspaces', req.url))
  }

  const name = form?.get('name')?.toString() || (await req.json().catch(() => ({}))).name
  const parsed = createWorkspaceSchema.safeParse({ name })
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
