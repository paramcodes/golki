import type { Metadata } from 'next'
import './globals.css'
import { DarkModeToggle } from '@/shared/ui/DarkModeToggle'

export const metadata: Metadata = {
  title: 'golki — Jira clone',
  description: 'Jira clone matching Atlassian design system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-end border-b border-ads-border bg-ads-bg px-4 py-2">
          <DarkModeToggle />
        </header>
        {children}
      </body>
    </html>
  )
}
