import { notFound } from 'next/navigation'
import { BoardClient } from '@/features/board'
import { prisma } from '@/server/db/prisma'

export const dynamic = 'force-dynamic'

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectKey: string }>
}) {
  const { workspaceSlug, projectKey } = await params
  const project = await prisma.project.findFirst({
    where: { key: projectKey, workspace: { slug: workspaceSlug } },
    include: {
      issues: {
        include: { assignee: true, labels: { include: { label: true } } },
        orderBy: { position: 'asc' },
      },
    },
  })
  if (!project) notFound()

  return <BoardClient project={project} />
}
