import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

async function validateAdminToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET || 'agir-admin-secret-2026'
  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [timestamp, hash] = parts

  // Web Crypto API (Edge Runtime compatible)
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp))
  const expectedHash = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  if (hash !== expectedHash) return false

  // Token valido por 24 horas
  const age = Date.now() - parseInt(timestamp)
  return age < 24 * 60 * 60 * 1000
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname

  // Admin login page - sempre acessivel
  if (pathname === '/admin-login') {
    return response
  }

  // Rotas de admin - verificar cookie admin_token
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_token')?.value

    if (!adminToken || !(await validateAdminToken(adminToken))) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session se necessário
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // Debug logs
  console.log('[Middleware] Path:', pathname)
  console.log('[Middleware] User:', user?.id || 'null')
  if (authError) console.log('[Middleware] Auth Error:', authError.message)

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ['/dashboard', '/courses', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Rotas de auth (login, register, etc)
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Se não está logado e tenta acessar rota protegida
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se está logado e tenta acessar rotas de auth
  // Permitir acesso ao login para trocar de conta, mas redirecionar registro
  if (user && isAuthRoute && pathname !== '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Aplicar middleware em todas as rotas exceto assets estáticos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
