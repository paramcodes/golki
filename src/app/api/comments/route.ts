import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { commentRepository } from '@/server/repositories/comment'
import { createCommentSchema } from '@/server/schemas/comment'
import type { IssueId, UserId } from '@/shared/types/ids'

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const comment = await commentRepository.create({
    issueId: parsed.data.issueId as IssueId,
    body: parsed.data.body,
    authorId: userId as UserId,
  })
  return NextResponse.json(comment)
}
