import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { issueRepository } from '@/server/repositories/issue'
import { projectRepository } from '@/server/repositories/project'
import { createIssueSchema } from '@/server/schemas/issue'
import type { ProjectId, SprintId, UserId } from '@/shared/types/ids'

export async function POST(req: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = createIssueSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const project = await projectRepository.findById(parsed.data.projectId as ProjectId)
  if (!project) return NextResponse.json({ error: 'project not found' }, { status: 404 })

  const count = await issueRepository.countByProject(project.id as ProjectId)
  const key = `${project.key}-${count + 1}`

  const issue = await issueRepository.create({
    key,
    title: parsed.data.title,
    description: parsed.data.description,
    type: parsed.data.type ?? 'task',
    priority: parsed.data.priority ?? 'medium',
    status: 'todo',
    projectId: project.id as ProjectId,
    reporterId: userId as UserId,
    assigneeId: parsed.data.assigneeId as UserId | undefined,
    estimate: parsed.data.estimate,
    sprintId: parsed.data.sprintId as SprintId | undefined,
  })
  return NextResponse.json(issue)
}
