import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(1),
})

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
