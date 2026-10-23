import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  })
  const workspaceIds = memberships.map((m) => m.workspaceId)
  const projects = await prisma.project.findMany({
    where: { workspaceId: { in: workspaceIds } },
    select: { id: true },
  })
  const projectIds = projects.map((p) => p.id)
  const issues = q
    ? await prisma.issue.findMany({
        where: {
          projectId: { in: projectIds },
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { key: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { project: true, assignee: true },
        take: 50,
      })
    : []

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-lg font-semibold">Search</h1>
      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search issues..."
          className="h-8 w-full rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm"
        />
      </form>
      <div className="space-y-2">
        {issues.map((i) => (
          <a
            key={i.id}
            href={`/issue/${i.id}`}
            className="block rounded-ads-md border border-ads-border bg-ads-bg p-3 hover:bg-ads-bg-subtle"
          >
            <span className="mr-2 text-xs text-ads-text-subtlest">{i.key}</span>
            <span className="text-sm text-ads-text">{i.title}</span>
            <span className="ml-2 text-xs text-ads-text-subtle">{i.project.key}</span>
          </a>
        ))}
        {q && issues.length === 0 ? (
          <p className="text-sm text-ads-text-subtle">No results</p>
        ) : null}
      </div>
    </div>
  )
}
