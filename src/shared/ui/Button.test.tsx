import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click</Button>)
    expect(screen.getByText('Click')).toBeInTheDocument()
  })
  it('applies primary variant', () => {
    render(<Button variant="primary">X</Button>)
    expect(screen.getByText('X')).toBeInTheDocument()
  })
})
