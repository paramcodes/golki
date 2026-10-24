import { redirect } from 'next/navigation'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { Header } from '@/shared/ui'

interface Workspace {
  id: string
  name: string
  slug: string
}

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ workspaceSlug: string }>
}) {
  const { workspaceSlug } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) redirect('/login')

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
  })

  const workspaces: Workspace[] = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
  }))

  const currentWorkspace = workspaces[0]

  if (!currentWorkspace) {
    redirect('/workspaces')
  }

  return (
    <div className="min-h-screen bg-ads-bg text-ads-text flex flex-col">
      <Header currentWorkspace={currentWorkspace} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
