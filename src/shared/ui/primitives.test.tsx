import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Badge, Dropdown, Select, Skeleton, Tag, Tooltip } from './index'

describe('Tag', () => {
  it('renders children', () => {
    render(<Tag>label</Tag>)
    expect(screen.getByText('label')).toBeInTheDocument()
  })
  it('supports color variants', () => {
    render(<Tag color="red">red</Tag>)
    render(
      <Tag color="blue" removable>
        blue
      </Tag>,
    )
    expect(screen.getByText('red')).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('renders count', () => {
    render(<Badge count={7} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })
  it('renders children', () => {
    render(<Badge>3</Badge>)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})

describe('Select', () => {
  it('renders options', () => {
    render(
      <Select
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
      />,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
  })
  it('changes value', async () => {
    const user = userEvent.setup()
    render(
      <Select
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
        defaultValue="a"
      />,
    )
    const select = screen.getByRole('combobox') as HTMLSelectElement
    await user.selectOptions(select, 'b')
    expect(select.value).toBe('b')
  })
})

describe('Tooltip', () => {
  it('renders trigger', () => {
    render(<Tooltip content="tip">hover</Tooltip>)
    expect(screen.getByText('hover')).toBeInTheDocument()
  })
  it('shows tooltip on hover', async () => {
    const user = userEvent.setup()
    render(<Tooltip content="tip">hover</Tooltip>)
    await user.hover(screen.getByText('hover'))
    expect(screen.getByText('tip')).toBeInTheDocument()
  })
})

describe('Skeleton', () => {
  it('renders', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('Dropdown', () => {
  it('renders trigger', () => {
    render(<Dropdown trigger={<button type="button">Open</button>} items={[{ label: 'Item' }]} />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })
  it('opens on click', async () => {
    const user = userEvent.setup()
    render(<Dropdown trigger={<button type="button">Open</button>} items={[{ label: 'Item' }]} />)
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Item')).toBeInTheDocument()
  })
})
