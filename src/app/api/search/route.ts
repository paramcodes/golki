import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  if (!q.trim()) return NextResponse.json({ issues: [] })

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  })
  const workspaceIds = memberships.map((m) => m.workspaceId)
  const projects = await prisma.project.findMany({
    where: { workspaceId: { in: workspaceIds } },
    select: { id: true },
  })
  const projectIds = projects.map((p) => p.id)

  const issues = await prisma.issue.findMany({
    where: {
      projectId: { in: projectIds },
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { key: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: { project: true, assignee: true },
    take: 10,
  })

  return NextResponse.json({
    issues: issues.map((i) => ({
      id: i.id,
      key: i.key,
      title: i.title,
      projectKey: i.project.key,
    })),
  })
}
