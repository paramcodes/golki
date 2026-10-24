import { describe, expect, it } from 'vitest'
import {
  createCommentSchema,
  createIssueSchema,
  createProjectSchema,
  createWorkspaceSchema,
  signupSchema,
  updateCommentSchema,
  updateIssueSchema,
  updateProjectSchema,
  updateWorkspaceSchema,
} from '@/server/schemas'

describe('server schemas', () => {
  describe('signupSchema', () => {
    it('validates valid signup data', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const result = signupSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })

    it('rejects short password', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: '123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createWorkspaceSchema', () => {
    it('validates valid workspace name', () => {
      const result = createWorkspaceSchema.safeParse({ name: 'My Workspace' })
      expect(result.success).toBe(true)
    })

    it('rejects empty name', () => {
      const result = createWorkspaceSchema.safeParse({ name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('updateWorkspaceSchema', () => {
    it('validates partial update', () => {
      const result = updateWorkspaceSchema.safeParse({ name: 'Updated Name' })
      expect(result.success).toBe(true)
    })

    it('allows empty object', () => {
      const result = updateWorkspaceSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('createProjectSchema', () => {
    it('validates valid project data', () => {
      const result = createProjectSchema.safeParse({
        workspaceSlug: 'my-workspace',
        key: 'PROJ',
        name: 'My Project',
        type: 'kanban',
        description: 'A test project',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid key length', () => {
      const result = createProjectSchema.safeParse({
        workspaceSlug: 'my-workspace',
        key: 'THISKEYISTOOLONG',
        name: 'My Project',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid type', () => {
      const result = createProjectSchema.safeParse({
        workspaceSlug: 'my-workspace',
        key: 'PROJ',
        name: 'My Project',
        type: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateProjectSchema', () => {
    it('validates partial update', () => {
      const result = updateProjectSchema.safeParse({
        name: 'Updated Project',
        type: 'scrum',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid type', () => {
      const result = updateProjectSchema.safeParse({ type: 'invalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('createIssueSchema', () => {
    it('validates valid issue data', () => {
      const result = createIssueSchema.safeParse({
        projectId: 'project-123',
        title: 'Test Issue',
        description: 'Description',
        type: 'story',
        priority: 'high',
        assigneeId: 'user-123',
        estimate: 5,
        sprintId: 'sprint-123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing title', () => {
      const result = createIssueSchema.safeParse({
        projectId: 'project-123',
        title: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid type', () => {
      const result = createIssueSchema.safeParse({
        projectId: 'project-123',
        title: 'Test',
        type: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid priority', () => {
      const result = createIssueSchema.safeParse({
        projectId: 'project-123',
        title: 'Test',
        priority: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateIssueSchema', () => {
    it('validates partial update', () => {
      const result = updateIssueSchema.safeParse({
        title: 'Updated Title',
        status: 'in_progress',
        priority: 'high',
        assigneeId: 'user-123',
        estimate: 3,
        sprintId: 'sprint-123',
        position: 5,
      })
      expect(result.success).toBe(true)
    })

    it('allows null assigneeId', () => {
      const result = updateIssueSchema.safeParse({ assigneeId: null })
      expect(result.success).toBe(true)
    })

    it('allows null sprintId', () => {
      const result = updateIssueSchema.safeParse({ sprintId: null })
      expect(result.success).toBe(true)
    })

    it('allows null estimate', () => {
      const result = updateIssueSchema.safeParse({ estimate: null })
      expect(result.success).toBe(true)
    })

    it('rejects invalid priority', () => {
      const result = updateIssueSchema.safeParse({ priority: 'invalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('createCommentSchema', () => {
    it('validates valid comment data', () => {
      const result = createCommentSchema.safeParse({
        issueId: 'issue-123',
        body: 'Test comment',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty body', () => {
      const result = createCommentSchema.safeParse({
        issueId: 'issue-123',
        body: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateCommentSchema', () => {
    it('validates valid update', () => {
      const result = updateCommentSchema.safeParse({ body: 'Updated comment' })
      expect(result.success).toBe(true)
    })

    it('rejects empty body', () => {
      const result = updateCommentSchema.safeParse({ body: '' })
      expect(result.success).toBe(false)
    })
  })
})
