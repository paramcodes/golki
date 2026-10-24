import { NextResponse } from 'next/server'
import { issueRepository } from '@/server/repositories/issue'
import { updateIssueSchema } from '@/server/schemas/issue'
import type { IssueId, SprintId, UserId } from '@/shared/types/ids'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = updateIssueSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const data = parsed.data
  const updateData = {
    ...data,
    assigneeId: data.assigneeId as UserId | null | undefined,
    sprintId: data.sprintId as SprintId | null | undefined,
  }

  const issue = await issueRepository.update(id as IssueId, updateData)
  return NextResponse.json(issue)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await issueRepository.delete(id as IssueId)
  return NextResponse.json({ ok: true })
}
