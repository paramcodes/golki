import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const savedFilterSchema = z.object({
  name: z.string().min(1).max(50),
  projectId: z.string().optional(),
  status: z.string().optional(),
  assigneeId: z.string().optional(),
  labelIds: z.array(z.string()).optional(),
  text: z.string().optional(),
})

export const dynamic = 'force-dynamic'

export async function GET(_req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  })
  const workspaceIds = memberships.map((m) => m.workspaceId)

  const filters = await prisma.savedFilter.findMany({
    where: {
      userId,
      workspaceId: { in: workspaceIds },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ filters })
}

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const body = form ?? (await req.json().catch(() => ({})))

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  })
  const workspaceIds = memberships.map((m) => m.workspaceId)
  const workspaceId = workspaceIds[0]

  if (!workspaceId) {
    return NextResponse.json({ error: 'no workspace' }, { status: 400 })
  }

  const parsed = savedFilterSchema.safeParse({
    name: body.name?.toString() ?? '',
    projectId: body.projectId?.toString() ?? undefined,
    status: body.status?.toString() ?? undefined,
    assigneeId: body.assigneeId?.toString() ?? undefined,
    labelIds: body.labelIds ? JSON.parse(body.labelIds.toString()) : undefined,
    text: body.text?.toString() ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const filter = await prisma.savedFilter.create({
    data: {
      ...parsed.data,
      userId,
      workspaceId,
    },
  })

  return NextResponse.json({ filter })
}
