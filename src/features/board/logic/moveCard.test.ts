import { describe, expect, it } from 'vitest'
import {
  groupByStatus,
  moveCard,
  moveCardPosition,
  reorderColumns,
  reorderWithinColumn,
} from './moveCard'

describe('moveCard', () => {
  it('updates status of matching issue', () => {
    const issues = [
      { id: '1', status: 'todo', position: 0 },
      { id: '2', status: 'done', position: 0 },
    ]
    const next = moveCard(issues, '1', 'done')
    expect(next[0]?.status).toBe('done')
    expect(next[1]?.status).toBe('done')
  })
  it('leaves others unchanged', () => {
    const issues = [{ id: '1', status: 'todo', position: 0 }]
    const next = moveCard(issues, 'x', 'done')
    expect(next[0]?.status).toBe('todo')
  })
})

describe('moveCardPosition', () => {
  it('moves issue to new status at position 0', () => {
    const issues = [
      { id: '1', status: 'todo', position: 0 },
      { id: '2', status: 'done', position: 0 },
      { id: '3', status: 'done', position: 1 },
    ]
    const next = moveCardPosition(issues, '1', 'done', 0)
    expect(next.find((i) => i.id === '1')?.status).toBe('done')
    expect(next.find((i) => i.id === '1')?.position).toBe(0)
    // Old done items shifted
    expect(next.find((i) => i.id === '2')?.position).toBe(1)
    expect(next.find((i) => i.id === '3')?.position).toBe(2)
  })

  it('moves issue within same status', () => {
    const issues = [
      { id: '1', status: 'todo', position: 0 },
      { id: '2', status: 'todo', position: 1 },
      { id: '3', status: 'todo', position: 2 },
    ]
    const next = moveCardPosition(issues, '3', 'todo', 0)
    expect(next.find((i) => i.id === '3')?.position).toBe(0)
    expect(next.find((i) => i.id === '1')?.position).toBe(1)
    expect(next.find((i) => i.id === '2')?.position).toBe(2)
  })
})

describe('reorderWithinColumn', () => {
  it('moves item down', () => {
    const issues = [
      { id: '1', status: 'todo', position: 0 },
      { id: '2', status: 'todo', position: 1 },
      { id: '3', status: 'todo', position: 2 },
    ]
    const next = reorderWithinColumn(issues, '1', 2)
    expect(next.find((i) => i.id === '1')?.position).toBe(2)
    expect(next.find((i) => i.id === '2')?.position).toBe(0)
    expect(next.find((i) => i.id === '3')?.position).toBe(1)
  })

  it('moves item up', () => {
    const issues = [
      { id: '1', status: 'todo', position: 0 },
      { id: '2', status: 'todo', position: 1 },
      { id: '3', status: 'todo', position: 2 },
    ]
    const next = reorderWithinColumn(issues, '3', 0)
    expect(next.find((i) => i.id === '3')?.position).toBe(0)
    expect(next.find((i) => i.id === '1')?.position).toBe(1)
    expect(next.find((i) => i.id === '2')?.position).toBe(2)
  })
})

describe('reorderColumns', () => {
  it('reorders columns', () => {
    const columns = [
      { id: '1', status: 'todo', label: 'To Do', position: 0 },
      { id: '2', status: 'in_progress', label: 'In Progress', position: 1 },
      { id: '3', status: 'done', label: 'Done', position: 2 },
    ]
    const next = reorderColumns(columns, 0, 2)
    expect(next[0]?.status).toBe('in_progress')
    expect(next[1]?.status).toBe('done')
    expect(next[2]?.status).toBe('todo')
    expect(next[0]?.position).toBe(0)
    expect(next[1]?.position).toBe(1)
    expect(next[2]?.position).toBe(2)
  })
})

describe('groupByStatus', () => {
  it('groups and sorts by position', () => {
    const groups = groupByStatus([
      { status: 'todo', position: 2 },
      { status: 'done', position: 0 },
      { status: 'todo', position: 0 },
      { status: 'todo', position: 1 },
    ])
    const todoGroup = groups.todo ?? []
    const doneGroup = groups.done ?? []
    expect(todoGroup).toHaveLength(3)
    expect(todoGroup[0]?.position).toBe(0)
    expect(todoGroup[1]?.position).toBe(1)
    expect(todoGroup[2]?.position).toBe(2)
    expect(doneGroup).toHaveLength(1)
  })
})
