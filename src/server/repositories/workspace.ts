import { prisma } from '@/server/db/prisma'
import type { UserId, WorkspaceId } from '@/shared/types/ids'

export const workspaceRepository = {
  async findBySlug(slug: string) {
    return prisma.workspace.findUnique({ where: { slug } })
  },

  async findById(id: WorkspaceId) {
    return prisma.workspace.findUnique({ where: { id } })
  },

  async create(data: { name: string; slug: string }) {
    return prisma.workspace.create({ data })
  },

  async addMember(workspaceId: WorkspaceId, userId: UserId, role: string = 'member') {
    return prisma.workspaceMember.create({
      data: { workspaceId, userId, role },
    })
  },

  async getMembers(workspaceId: WorkspaceId) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
    })
  },

  async getUserRole(workspaceId: WorkspaceId, userId: UserId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    })
    return member?.role ?? null
  },

  async update(workspaceId: WorkspaceId, data: { name?: string }) {
    return prisma.workspace.update({ where: { id: workspaceId }, data })
  },

  async delete(workspaceId: WorkspaceId) {
    return prisma.workspace.delete({ where: { id: workspaceId } })
  },

  async getProjects(workspaceId: WorkspaceId) {
    return prisma.project.findMany({
      where: { workspaceId },
      include: { lead: true },
    })
  },
}
