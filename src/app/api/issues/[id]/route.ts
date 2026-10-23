import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/server/db/prisma'

const schema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  type: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  estimate: z.number().nullable().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const issue = await prisma.issue.update({
    where: { id },
    data: parsed.data,
    include: { assignee: true, labels: { include: { label: true } } },
  })
  return NextResponse.json(issue)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.issue.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
