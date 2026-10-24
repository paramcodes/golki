import { prisma } from '@/server/db/prisma'
import type { IssueId, ProjectId, SprintId, UserId } from '@/shared/types/ids'

export const issueRepository = {
  async findById(id: IssueId) {
    return prisma.issue.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        reporter: true,
        labels: { include: { label: true } },
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        attachments: { include: { author: true } },
      },
    })
  },

  async findByKey(projectId: ProjectId, key: string) {
    return prisma.issue.findUnique({
      where: { projectId_key: { projectId, key } },
    })
  },

  async create(data: {
    key: string
    title: string
    description?: string
    type: string
    priority: string
    status: string
    projectId: ProjectId
    reporterId: UserId
    assigneeId?: UserId
    estimate?: number
    sprintId?: SprintId
  }) {
    return prisma.issue.create({
      data,
      include: { assignee: true, labels: { include: { label: true } } },
    })
  },

  async update(
    issueId: IssueId,
    data: Partial<{
      title: string
      description: string
      status: string
      priority: string
      type: string
      assigneeId: UserId | null
      estimate: number | null
      sprintId: SprintId | null
      position: number
    }>,
  ) {
    const updateData: Partial<{
      title: string
      description: string
      status: string
      priority: string
      type: string
      assigneeId: string | null
      estimate: number | null
      sprintId: string | null
      position: number
    }> = { ...data }

    if (data.assigneeId !== undefined) {
      updateData.assigneeId = data.assigneeId ?? null
    }
    if (data.sprintId !== undefined) {
      updateData.sprintId = data.sprintId ?? null
    }

    return prisma.issue.update({
      where: { id: issueId },
      data: updateData,
      include: { assignee: true, labels: { include: { label: true } } },
    })
  },

  async delete(issueId: IssueId) {
    return prisma.issue.delete({ where: { id: issueId } })
  },

  async getByProject(
    projectId: ProjectId,
    options?: {
      status?: string
      assigneeId?: UserId
      sprintId?: SprintId | null
    },
  ) {
    return prisma.issue.findMany({
      where: {
        projectId,
        ...(options?.status && { status: options.status }),
        ...(options?.assigneeId && { assigneeId: options.assigneeId }),
        ...(options?.sprintId !== undefined && { sprintId: options.sprintId }),
      },
      include: { assignee: true, labels: { include: { label: true } } },
      orderBy: { position: 'asc' },
    })
  },

  async countByProject(projectId: ProjectId) {
    return prisma.issue.count({ where: { projectId } })
  },

  async updatePosition(issueId: IssueId, position: number) {
    return prisma.issue.update({ where: { id: issueId }, data: { position } })
  },

  async getAttachments(issueId: IssueId) {
    return prisma.attachment.findMany({
      where: { issueId },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  async createAttachment(data: {
    name: string
    url: string
    size: number
    mimeType: string
    issueId: IssueId
    authorId: UserId
  }) {
    return prisma.attachment.create({ data, include: { author: true } })
  },

  async deleteAttachment(attachmentId: string) {
    return prisma.attachment.delete({ where: { id: attachmentId } })
  },
}
