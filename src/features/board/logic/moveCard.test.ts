import { describe, expect, it } from 'vitest'
import { groupByStatus, moveCard } from './moveCard'

describe('moveCard', () => {
  it('updates status of matching issue', () => {
    const issues = [
      { id: '1', status: 'todo' },
      { id: '2', status: 'done' },
    ]
    const next = moveCard(issues, '1', 'done')
    expect(next[0]?.status).toBe('done')
    expect(next[1]?.status).toBe('done')
  })
  it('leaves others unchanged', () => {
    const issues = [{ id: '1', status: 'todo' }]
    const next = moveCard(issues, 'x', 'done')
    expect(next[0]?.status).toBe('todo')
  })
})

describe('groupByStatus', () => {
  it('groups', () => {
    const groups = groupByStatus([{ status: 'todo' }, { status: 'done' }, { status: 'todo' }])
    expect(groups.todo).toHaveLength(2)
    expect(groups.done).toHaveLength(1)
  })
})
