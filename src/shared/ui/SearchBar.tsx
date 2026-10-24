'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { type KeyboardEvent, useEffect, useState } from 'react'
import { cn } from '@/shared/lib/cn'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export function SearchBar({ placeholder = 'Search issues...', className }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') ?? '')
  const [isFocused, setIsFocused] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<
    Array<{
      id: string
      key: string
      title: string
      projectKey: string
    }>
  >([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const debouncedSearch = async (q: string) => {
      if (!q.trim()) {
        setResults([])
        setShowResults(false)
        return
      }
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.issues ?? [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
    const timeout = setTimeout(() => {
      debouncedSearch(query)
    }, 200)
    return () => clearTimeout(timeout)
  }, [query])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.trim()) {
      setShowResults(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      setShowResults(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const handleResultClick = (issue: { id: string; key: string }) => {
    router.push(`/issue/${issue.id}`)
    setShowResults(false)
  }

  return (
    <div className={cn('relative flex-1 max-w-xl', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="global-search" className="sr-only">
          Search
        </label>
        <input
          id="global-search"
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'h-8 w-full rounded-ads-md border bg-ads-bg-input px-2 text-sm text-ads-text placeholder:text-ads-text-subtlest transition-colors',
            isFocused || showResults
              ? 'border-ads-border-focused focus:outline-none'
              : 'border-ads-border-input',
            showResults ? 'rounded-b-none' : '',
          )}
          autoComplete="off"
        />
        {isLoading && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-ads-text-subtle animate-spin">
            ⏳
          </span>
        )}
      </form>
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-b-ads-md rounded-t-none border border-ads-border bg-ads-bg shadow-ads-elevated overflow-hidden">
          {results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((issue) => (
                <li key={issue.id}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(issue)}
                    className="w-full px-3 py-2 text-left text-sm text-ads-text hover:bg-ads-bg-subtle flex items-center gap-2"
                  >
                    <span className="text-xs font-mono text-ads-text-subtlest">{issue.key}</span>
                    <span className="flex-1 truncate">{issue.title}</span>
                    <span className="text-xs text-ads-text-subtle">{issue.projectKey}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <p className="px-3 py-2 text-sm text-ads-text-subtle">No results</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchBar
