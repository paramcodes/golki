'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Input } from '@/shared/ui'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Signup failed')
      return
    }
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ads-bg-subtle">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-ads-lg bg-ads-bg p-6 shadow"
      >
        <h1 className="text-lg font-semibold text-ads-text">Sign up for golki</h1>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="text-sm text-ads-accent-red">{error}</p> : null}
        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Sign up
        </Button>
        <p className="text-center text-sm text-ads-text-subtle">
          Have an account?{' '}
          <a href="/login" className="text-ads-text-link">
            Log in
          </a>
        </p>
      </form>
    </div>
  )
}
