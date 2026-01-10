import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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
  console.log('[Proxy] Path:', request.nextUrl.pathname)
  console.log('[Proxy] User:', user?.id || 'null')
  if (authError) console.log('[Proxy] Auth Error:', authError.message)

  const pathname = request.nextUrl.pathname

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ['/dashboard', '/courses', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Rotas de admin
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

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

  // Se tenta acessar rota de admin, verificar se é admin
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Aplicar middleware em todas as rotas exceto assets estáticos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
