import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { workspaceRepository } from '@/server/repositories/workspace'
import { createWorkspaceSchema } from '@/server/schemas/workspace'
import type { UserId, WorkspaceId } from '@/shared/types/ids'

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
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

  const ws = await workspaceRepository.create({ name: parsed.data.name, slug })
  await workspaceRepository.addMember(ws.id as WorkspaceId, userId as UserId, 'admin')
  return NextResponse.redirect(new URL('/workspaces', req.url))
}
