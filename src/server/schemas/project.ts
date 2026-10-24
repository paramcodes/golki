import { z } from 'zod'

export const createProjectSchema = z.object({
  workspaceSlug: z.string(),
  key: z.string().min(1).max(10),
  name: z.string().min(1),
  type: z.enum(['kanban', 'scrum']).optional(),
  description: z.string().optional(),
})

export const updateProjectSchema = z.object({
  key: z.string().min(1).max(10).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['kanban', 'scrum']).optional(),
  leadId: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
