import Link from 'next/link'
import { notFound } from 'next/navigation'
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
      issues: { include: { assignee: true }, orderBy: { position: 'asc' } },
      sprints: true,
    },
  })
  if (!project) notFound()
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{project.key} Backlog</h1>
        <Link href={`/w/${workspaceSlug}/p/${projectKey}`} className="text-sm text-ads-text-link">
          Board
        </Link>
      </div>
      <div className="space-y-2">
        {project.issues.map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between rounded-ads-md border border-ads-border bg-ads-bg p-3"
          >
            <div>
              <span className="mr-2 text-xs text-ads-text-subtlest">{i.key}</span>
              <span className="text-sm text-ads-text">{i.title}</span>
            </div>
            <span className="text-xs text-ads-text-subtle">{i.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
