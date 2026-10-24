import { describe, expect, it } from 'vitest'

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Date.now().toString(36)
  )
}

describe('workspace slug generation', () => {
  it('generates slug from simple name', () => {
    const slug = generateSlug('My Workspace')
    expect(slug).toMatch(/^my-workspace-[a-z0-9]+$/)
  })

  it('handles special characters', () => {
    const slug = generateSlug('My@Workspace!')
    expect(slug).toMatch(/^my-workspace-[a-z0-9]+$/)
  })

  it('handles leading/trailing spaces', () => {
    const slug = generateSlug('  My Workspace  ')
    expect(slug).toMatch(/^my-workspace-[a-z0-9]+$/)
  })

  it('handles multiple spaces', () => {
    const slug = generateSlug('My   Workspace')
    expect(slug).toMatch(/^my-workspace-[a-z0-9]+$/)
  })
})
