import { describe, expect, it } from 'vitest'
import { z } from 'zod'

const createProjectSchema = z.object({
  workspaceSlug: z.string(),
  key: z.string().min(1).max(10),
  name: z.string().min(1),
  type: z.enum(['kanban', 'scrum']).optional(),
})

const updateProjectSchema = z.object({
  key: z.string().min(1).max(10).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['kanban', 'scrum']).optional(),
  leadId: z.string().optional(),
})

describe('project key validation', () => {
  it('accepts valid key', () => {
    const result = createProjectSchema.safeParse({
      workspaceSlug: 'ws',
      key: 'PROJ',
      name: 'Project',
      type: 'kanban',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty key', () => {
    const result = createProjectSchema.safeParse({
      workspaceSlug: 'ws',
      key: '',
      name: 'Project',
    })
    expect(result.success).toBe(false)
  })

  it('rejects key longer than 10 chars', () => {
    const result = createProjectSchema.safeParse({
      workspaceSlug: 'ws',
      key: 'TOOLONGKEYS',
      name: 'Project',
    })
    expect(result.success).toBe(false)
  })

  it('accepts scrum type', () => {
    const result = createProjectSchema.safeParse({
      workspaceSlug: 'ws',
      key: 'SCRUM',
      name: 'Scrum Project',
      type: 'scrum',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid type', () => {
    const result = createProjectSchema.safeParse({
      workspaceSlug: 'ws',
      key: 'PROJ',
      name: 'Project',
      type: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  describe('update project schema', () => {
    it('accepts partial update with key', () => {
      const result = updateProjectSchema.safeParse({ key: 'NEWKEY' })
      expect(result.success).toBe(true)
    })

    it('accepts partial update with name', () => {
      const result = updateProjectSchema.safeParse({ name: 'New Name' })
      expect(result.success).toBe(true)
    })

    it('accepts partial update with type', () => {
      const result = updateProjectSchema.safeParse({ type: 'scrum' })
      expect(result.success).toBe(true)
    })

    it('accepts partial update with leadId', () => {
      const result = updateProjectSchema.safeParse({ leadId: 'user-123' })
      expect(result.success).toBe(true)
    })

    it('rejects empty key in update', () => {
      const result = updateProjectSchema.safeParse({ key: '' })
      expect(result.success).toBe(false)
    })
  })
})
