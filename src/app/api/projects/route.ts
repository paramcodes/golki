import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { projectRepository } from '@/server/repositories/project'
import { workspaceRepository } from '@/server/repositories/workspace'
import { createProjectSchema } from '@/server/schemas/project'
import type { UserId, WorkspaceId } from '@/shared/types/ids'

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const data = {
    workspaceSlug: form?.get('workspaceSlug')?.toString() ?? '',
    key: form?.get('key')?.toString() ?? '',
    name: form?.get('name')?.toString() ?? '',
    type: form?.get('type')?.toString() ?? 'kanban',
    description: form?.get('description')?.toString() ?? '',
  }
  const parsed = createProjectSchema.safeParse(data)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const ws = await workspaceRepository.findBySlug(parsed.data.workspaceSlug)
  if (!ws) return NextResponse.json({ error: 'workspace not found' }, { status: 404 })

  const existingProject = await projectRepository.findByKey(ws.id as WorkspaceId, parsed.data.key)
  if (existingProject) {
    return NextResponse.json({ error: 'project key already exists' }, { status: 409 })
  }

  const project = await projectRepository.create({
    key: parsed.data.key.toUpperCase(),
    name: parsed.data.name,
    workspaceId: ws.id as WorkspaceId,
    leadId: userId as UserId,
    type: parsed.data.type ?? 'kanban',
    description: parsed.data.description,
  })
  return NextResponse.redirect(new URL(`/w/${parsed.data.workspaceSlug}/p/${project.key}`, req.url))
}
