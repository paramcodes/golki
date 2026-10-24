import { prisma } from '@/server/db/prisma'
import type { CommentId, IssueId, UserId } from '@/shared/types/ids'

export const commentRepository = {
  async findById(id: CommentId) {
    return prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    })
  },

  async create(data: { issueId: IssueId; body: string; authorId: UserId }) {
    return prisma.comment.create({
      data,
      include: { author: true },
    })
  },

  async update(commentId: CommentId, body: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: { body },
      include: { author: true },
    })
  },

  async delete(commentId: CommentId) {
    return prisma.comment.delete({ where: { id: commentId } })
  },

  async getByIssue(issueId: IssueId) {
    return prisma.comment.findMany({
      where: { issueId },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    })
  },
}
