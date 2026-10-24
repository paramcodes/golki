'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button, Input } from '@/shared/ui'

interface IssueForFilter {
  assignee?: { id: string; name?: string | null } | null
  type: string
  priority: string
  labels?: Array<{ label: { id: string; name: string; color: string } }>
  title: string
  key: string
}

interface FilterBarProps {
  issues: IssueForFilter[]
  onFilterChange: (filters: BoardFilters) => void
  initialFilters?: BoardFilters
}

export interface BoardFilters {
  assigneeIds: string[]
  types: string[]
  priorities: string[]
  labelIds: string[]
  text: string
}

const DEFAULT_FILTERS: BoardFilters = {
  assigneeIds: [],
  types: [],
  priorities: [],
  labelIds: [],
  text: '',
}

function getUniqueAssignees(issues: IssueForFilter[]): Array<{ id: string; name: string }> {
  const seen = new Set<string>()
  const result: Array<{ id: string; name: string }> = []
  for (const issue of issues) {
    const assignee = issue.assignee
    if (assignee?.id && !seen.has(assignee.id)) {
      seen.add(assignee.id)
      result.push({ id: assignee.id, name: assignee.name ?? 'Unassigned' })
    }
  }
  return result
}

function getUniqueValues<T extends string>(
  issues: IssueForFilter[],
  key: keyof IssueForFilter,
): T[] {
  const seen = new Set<T>()
  const result: T[] = []
  for (const issue of issues) {
    const val = issue[key] as T
    if (val && !seen.has(val)) {
      seen.add(val)
      result.push(val)
    }
  }
  return result
}

function getUniqueLabels(
  issues: IssueForFilter[],
): Array<{ id: string; name: string; color: string }> {
  const labelMap = new Map<string, { id: string; name: string; color: string }>()
  for (const issue of issues) {
    for (const { label } of issue.labels ?? []) {
      labelMap.set(label.id, label)
    }
  }
  return Array.from(labelMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function FilterBar({
  issues,
  onFilterChange,
  initialFilters = DEFAULT_FILTERS,
}: FilterBarProps) {
  const [filters, setFilters] = useState<BoardFilters>(initialFilters)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const assignees = useMemo(() => getUniqueAssignees(issues), [issues])
  const types = useMemo(() => getUniqueValues<string>(issues, 'type').sort(), [issues])
  const priorities = useMemo(
    () =>
      getUniqueValues<string>(issues, 'priority').sort((a, b) => {
        const order = ['lowest', 'low', 'medium', 'high', 'highest']
        return order.indexOf(a) - order.indexOf(b)
      }),
    [issues],
  )
  const labels = useMemo(() => getUniqueLabels(issues), [issues])

  const toggleMenu = useCallback((menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }))
  }, [])

  const toggleAssignee = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(id)
        ? prev.assigneeIds.filter((i) => i !== id)
        : [...prev.assigneeIds, id],
    }))
  }, [])

  const toggleType = useCallback((type: string) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }))
  }, [])

  const togglePriority = useCallback((priority: string) => {
    setFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }))
  }, [])

  const toggleLabel = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      labelIds: prev.labelIds.includes(id)
        ? prev.labelIds.filter((l) => l !== id)
        : [...prev.labelIds, id],
    }))
  }, [])

  const setText = useCallback((text: string) => {
    setFilters((prev) => ({ ...prev, text }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const hasActiveFilters = useMemo(
    () =>
      filters.assigneeIds.length > 0 ||
      filters.types.length > 0 ||
      filters.priorities.length > 0 ||
      filters.labelIds.length > 0 ||
      filters.text.length > 0,
    [filters],
  )

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-ads-border px-4 py-3">
      {/* Text Search */}
      <div className="relative flex-1 min-w-[200px]">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-ads-text-subtlest">
            🔍
          </span>
          <Input
            placeholder="Filter by title, key…"
            value={filters.text}
            onChange={(e) => setText(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </div>

      {/* Assignee Filter */}
      <FilterMenu
        trigger="Assignee"
        open={openMenus.assignee ?? false}
        onToggle={() => toggleMenu('assignee')}
        selectedCount={filters.assigneeIds.length}
      >
        {assignees.map((assignee) => (
          <label
            key={assignee.id}
            className="flex items-center gap-2 px-2 py-1 hover:bg-ads-bg-subtle rounded-ads-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters.assigneeIds.includes(assignee.id)}
              onChange={() => toggleAssignee(assignee.id)}
              className="rounded-ads-sm border-ads-border-input"
            />
            <span>{assignee.name}</span>
          </label>
        ))}
      </FilterMenu>

      {/* Type Filter */}
      <FilterMenu
        trigger="Type"
        open={openMenus.type ?? false}
        onToggle={() => toggleMenu('type')}
        selectedCount={filters.types.length}
      >
        {types.map((type) => (
          <label
            key={type}
            className="flex items-center gap-2 px-2 py-1 hover:bg-ads-bg-subtle rounded-ads-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters.types.includes(type)}
              onChange={() => toggleType(type)}
              className="rounded-ads-sm border-ads-border-input"
            />
            <span>{type}</span>
          </label>
        ))}
      </FilterMenu>

      {/* Priority Filter */}
      <FilterMenu
        trigger="Priority"
        open={openMenus.priority ?? false}
        onToggle={() => toggleMenu('priority')}
        selectedCount={filters.priorities.length}
      >
        {priorities.map((priority) => (
          <label
            key={priority}
            className="flex items-center gap-2 px-2 py-1 hover:bg-ads-bg-subtle rounded-ads-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters.priorities.includes(priority)}
              onChange={() => togglePriority(priority)}
              className="rounded-ads-sm border-ads-border-input"
            />
            <span>{priority}</span>
          </label>
        ))}
      </FilterMenu>

      {/* Label Filter */}
      <FilterMenu
        trigger="Label"
        open={openMenus.label ?? false}
        onToggle={() => toggleMenu('label')}
        selectedCount={filters.labelIds.length}
      >
        {labels.map((label) => (
          <label
            key={label.id}
            className="flex items-center gap-2 px-2 py-1 hover:bg-ads-bg-subtle rounded-ads-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters.labelIds.includes(label.id)}
              onChange={() => toggleLabel(label.id)}
              className="rounded-ads-sm border-ads-border-input"
            />
            <span className="flex items-center gap-2" style={{ color: label.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
              {label.name}
            </span>
          </label>
        ))}
      </FilterMenu>

      {hasActiveFilters && (
        <Button variant="subtle" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )
}

interface FilterMenuProps {
  trigger: string
  open: boolean
  onToggle: () => void
  selectedCount: number
  children: React.ReactNode
}

function FilterMenu({ trigger, open, onToggle, selectedCount, children }: FilterMenuProps) {
  return (
    <div className="relative">
      <Button variant="subtle" size="sm" className="gap-1" onClick={onToggle}>
        {trigger}
        {selectedCount > 0 && (
          <span
            className={cn(
              'ml-1 rounded-full bg-ads-accent-blue px-1.5 py-0.5 text-[10px] font-medium text-white',
            )}
          >
            {selectedCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute z-50 mt-1 w-48 rounded-ads-md border border-ads-border bg-ads-bg shadow-lg p-2">
          {children}
        </div>
      )}
    </div>
  )
}
