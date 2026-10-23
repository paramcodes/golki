'use client'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button, Input } from '@/shared/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError('Invalid credentials')
    else router.push('/workspaces')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ads-bg-subtle">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-ads-lg bg-ads-bg p-6 shadow"
      >
        <h1 className="text-lg font-semibold text-ads-text">Log in to golki</h1>
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
          Log in
        </Button>
        <p className="text-center text-sm text-ads-text-subtle">
          No account?{' '}
          <a href="/signup" className="text-ads-text-link">
            Sign up
          </a>
        </p>
      </form>
    </div>
  )
}
