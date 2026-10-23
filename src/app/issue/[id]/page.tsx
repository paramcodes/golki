import { notFound } from 'next/navigation'
import { IssueDetail } from '@/features/issue'
import { prisma } from '@/server/db/prisma'

export const dynamic = 'force-dynamic'

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const issue = await prisma.issue.findUnique({
    where: { id },
    include: {
      assignee: true,
      reporter: true,
      project: true,
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      labels: { include: { label: true } },
    },
  })
  if (!issue) notFound()
  return <IssueDetail issue={issue} />
}
