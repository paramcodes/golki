import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/server/db/prisma'

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'highest']).optional(),
  type: z.enum(['task', 'story', 'bug', 'epic']).optional(),
  assigneeId: z.string().nullable().optional(),
  estimate: z.number().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const data = parsed.data

  // Handle labels separately if provided
  const { labels, ...issueData } = data

  const issue = await prisma.issue.update({
    where: { id },
    data: {
      ...issueData,
      ...(labels !== undefined
        ? {
            labels: {
              deleteMany: {},
              create: labels.map((labelId) => ({ labelId })),
            },
          }
        : undefined),
    },
    include: { assignee: true, labels: { include: { label: true } }, sprint: true },
  })

  return NextResponse.json(issue)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.issue.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
