'use client'
import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  EmptyState,
  Input,
  Lozenge,
  Modal,
  Select,
  Skeleton,
  Spinner,
  Tabs,
  Tag,
  Textarea,
  Tooltip,
} from '@/shared/ui'

const tabItems = [
  { key: 'board', label: 'Board' },
  { key: 'backlog', label: 'Backlog' },
]

function PrimitiveSet() {
  const [tab, setTab] = useState('board')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectValue, setSelectValue] = useState('a')
  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-wrap items-center gap-2">
        <Button variant="primary">Primary</Button>
        <Button>Default</Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="danger">Danger</Button>
        <Spinner />
      </section>
      <section className="flex flex-wrap items-center gap-2">
        <Lozenge>Default</Lozenge>
        <Lozenge appearance="success">Success</Lozenge>
        <Lozenge appearance="removed">Removed</Lozenge>
        <Tag color="blue">Blue tag</Tag>
        <Tag color="red" removable>
          Removable
        </Tag>
        <Badge count={5} />
        <Badge>3</Badge>
        <Avatar name="Ada Lovelace" />
      </section>
      <section className="flex flex-col gap-2 max-w-sm">
        <Input label="Input" placeholder="Type..." />
        <Textarea label="Textarea" placeholder="Notes..." />
        <Select
          label="Select"
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ]}
          value={selectValue}
          onChange={(e) => setSelectValue(e.target.value)}
        />
      </section>
      <section className="flex flex-wrap items-center gap-3">
        <Tabs items={tabItems} value={tab} onChange={setTab} />
        <Dropdown
          trigger={<Button>Open menu</Button>}
          items={[{ label: 'Edit' }, { label: 'Delete' }]}
        />
        <Tooltip content="Helpful tip" side="top">
          <Button size="sm">Hover me</Button>
        </Tooltip>
      </section>
      <section className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" circle />
        <EmptyState
          title="Nothing here"
          description="Create your first item"
          action={<Button>Create</Button>}
        />
      </section>
      <section>
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Modal">
          <p>Modal body content</p>
        </Modal>
      </section>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-ads-bg">
      <div className="border-b border-ads-border px-4 py-3">
        <h1 className="text-lg font-semibold text-ads-text">Primitive preview</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div data-color-mode="light" className="bg-ads-bg text-ads-text">
          <h2 className="px-4 py-2 text-sm font-semibold text-ads-text-subtle">Light</h2>
          <PrimitiveSet />
        </div>
        <div data-color-mode="dark" className="bg-ads-bg text-ads-text">
          <h2 className="px-4 py-2 text-sm font-semibold text-ads-text-subtle">Dark</h2>
          <PrimitiveSet />
        </div>
      </div>
    </main>
  )
}
