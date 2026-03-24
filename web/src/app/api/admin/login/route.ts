import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const ADMIN_EMAIL = 'admin@agir.com'
const ADMIN_PASSWORD = 'Agir2026'

// Token simples baseado em HMAC
function generateToken(): string {
  const secret = process.env.ADMIN_SECRET || 'agir-admin-secret-2026'
  const timestamp = Date.now().toString()
  const hmac = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  return `${timestamp}.${hmac}`
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Credenciais invalidas' },
        { status: 401 }
      )
    }

    const token = generateToken()
    const cookieStore = await cookies()

    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
