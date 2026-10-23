import Link from 'next/link'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { Button } from '@/shared/ui'

export const dynamic = 'force-dynamic'

export default async function WorkspacesPage() {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: { include: { projects: true } } },
  })

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Workspaces</h1>
        <form action="/api/workspaces" method="post" className="flex gap-2">
          <input
            name="name"
            placeholder="Workspace name"
            required
            className="h-8 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm"
          />
          <Button type="submit" variant="primary">
            Create
          </Button>
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {memberships.map((m) => (
          <div
            key={m.workspace.id}
            className="rounded-ads-lg border border-ads-border bg-ads-bg p-4"
          >
            <h2 className="font-semibold">{m.workspace.name}</h2>
            <p className="text-sm text-ads-text-subtle">{m.workspace.projects.length} projects</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {m.workspace.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/w/${m.workspace.slug}/p/${p.key}`}
                  className="rounded-ads-md bg-ads-bg-subtle px-2 py-1 text-sm text-ads-text-link"
                >
                  {p.key} {p.name}
                </Link>
              ))}
            </div>
            <form action="/api/projects" method="post" className="mt-3 flex gap-2">
              <input type="hidden" name="workspaceSlug" value={m.workspace.slug} />
              <input
                name="key"
                placeholder="KEY"
                required
                className="h-8 w-16 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm"
              />
              <input
                name="name"
                placeholder="Project name"
                required
                className="h-8 flex-1 rounded-ads-md border border-ads-border-input bg-ads-bg-input px-2 text-sm"
              />
              <Button type="submit" size="sm">
                Create
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
