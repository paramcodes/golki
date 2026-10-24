import { z } from 'zod'

export const createIssueSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['task', 'story', 'bug', 'epic']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'highest']).optional(),
  assigneeId: z.string().optional(),
  estimate: z.number().optional(),
  sprintId: z.string().optional(),
})

export const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'highest']).optional(),
  type: z.enum(['task', 'story', 'bug', 'epic']).optional(),
  assigneeId: z.string().nullable().optional(),
  estimate: z.number().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  position: z.number().optional(),
})

export type CreateIssueInput = z.infer<typeof createIssueSchema>
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>
