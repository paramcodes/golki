'use client'
import { useEffect, useState } from 'react'
import { Button } from './Button'

export function DarkModeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const stored = localStorage.getItem('color-mode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored ? stored === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.setAttribute('data-color-mode', isDark ? 'dark' : 'light')
  }, [])
  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-color-mode', next ? 'dark' : 'light')
    localStorage.setItem('color-mode', next ? 'dark' : 'light')
  }
  return (
    <Button size="sm" onClick={toggle}>
      {dark ? 'Light' : 'Dark'}
    </Button>
  )
}
