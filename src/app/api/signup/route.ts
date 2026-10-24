import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { userRepository } from '@/server/repositories/user'
import { signupSchema } from '@/server/schemas/user'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  const { email, password, name } = parsed.data
  const existing = await userRepository.findByEmail(email)
  if (existing) return NextResponse.json({ error: 'email in use' }, { status: 409 })
  const hash = await bcrypt.hash(password, 10)
  const user = await userRepository.create({ email, password: hash, name })
  return NextResponse.json({ id: user.id, email: user.email })
}
