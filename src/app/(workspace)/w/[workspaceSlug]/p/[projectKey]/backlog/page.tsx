import { notFound } from 'next/navigation'
import { BacklogClient } from '@/features/backlog/BacklogClient'
import { prisma } from '@/server/db/prisma'

export const dynamic = 'force-dynamic'

export default async function BacklogPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectKey: string }>
}) {
  const { workspaceSlug, projectKey } = await params
  const project = await prisma.project.findFirst({
    where: { key: projectKey, workspace: { slug: workspaceSlug } },
    include: {
      issues: {
        include: {
          assignee: true,
          labels: { include: { label: true } },
          sprint: true,
        },
        orderBy: { position: 'asc' },
      },
      sprints: {
        include: {
          issues: {
            include: {
              assignee: true,
              labels: { include: { label: true } },
              sprint: true,
            },
            orderBy: { position: 'asc' },
          },
          _count: { select: { issues: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!project) notFound()

  return <BacklogClient project={project} workspaceSlug={workspaceSlug} />
}
