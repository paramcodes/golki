import { prisma } from '@/server/db/prisma'
import type { UserId } from '@/shared/types/ids'

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  async findById(id: UserId) {
    return prisma.user.findUnique({ where: { id } })
  },

  async create(data: { email: string; password: string; name?: string }) {
    return prisma.user.create({ data })
  },

  async update(id: UserId, data: Partial<{ name: string; avatarUrl: string; password: string }>) {
    return prisma.user.update({ where: { id }, data })
  },

  async getWorkspaces(userId: UserId) {
    return prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
    })
  },

  async getAssignedIssues(userId: UserId) {
    return prisma.issue.findMany({
      where: { assigneeId: userId },
      include: { project: true },
    })
  },

  async getReportedIssues(userId: UserId) {
    return prisma.issue.findMany({
      where: { reporterId: userId },
      include: { project: true },
    })
  },
}
