import { redirect } from 'next/navigation'
import { auth } from '@/server/auth/auth'

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return <div className="min-h-screen bg-ads-bg text-ads-text">{children}</div>
}
