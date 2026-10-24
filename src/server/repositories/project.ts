import { prisma } from '@/server/db/prisma'
import type { ProjectId, UserId, WorkspaceId } from '@/shared/types/ids'

export const projectRepository = {
  async findById(id: ProjectId) {
    return prisma.project.findUnique({
      where: { id },
      include: { workspace: true, lead: true },
    })
  },

  async findByKey(workspaceId: WorkspaceId, key: string) {
    return prisma.project.findUnique({
      where: { workspaceId_key: { workspaceId, key: key.toUpperCase() } },
    })
  },

  async create(data: {
    key: string
    name: string
    workspaceId: WorkspaceId
    leadId: UserId
    type?: string
    description?: string
  }) {
    return prisma.project.create({ data })
  },

  async update(
    projectId: ProjectId,
    data: Partial<{
      key: string
      name: string
      description: string
      type: string
      leadId: UserId
    }>,
  ) {
    return prisma.project.update({ where: { id: projectId }, data })
  },

  async delete(projectId: ProjectId) {
    return prisma.project.delete({ where: { id: projectId } })
  },

  async getIssues(projectId: ProjectId) {
    return prisma.issue.findMany({
      where: { projectId },
      include: { assignee: true, labels: { include: { label: true } } },
      orderBy: { position: 'asc' },
    })
  },

  async getSprints(projectId: ProjectId) {
    return prisma.sprint.findMany({
      where: { projectId },
      include: { issues: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getLabels(projectId: ProjectId) {
    return prisma.label.findMany({ where: { projectId } })
  },

  async createLabel(projectId: ProjectId, name: string, color?: string) {
    return prisma.label.create({
      data: { name, color: color ?? '#6b6e76', projectId },
    })
  },

  async updateLabel(labelId: string, data: { name?: string; color?: string }) {
    return prisma.label.update({ where: { id: labelId }, data })
  },

  async deleteLabel(labelId: string) {
    return prisma.label.delete({ where: { id: labelId } })
  },

  async addLabelToIssue(issueId: string, labelId: string) {
    return prisma.issueLabel.create({ data: { issueId, labelId } })
  },

  async removeLabelFromIssue(issueId: string, labelId: string) {
    return prisma.issueLabel.delete({ where: { issueId_labelId: { issueId, labelId } } })
  },
}
