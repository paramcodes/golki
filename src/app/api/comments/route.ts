import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

const schema = z.object({ issueId: z.string(), body: z.string().min(1) })

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const comment = await prisma.comment.create({
    data: { issueId: parsed.data.issueId, body: parsed.data.body, authorId: userId },
    include: { author: true },
  })
  return NextResponse.json(comment)
}
