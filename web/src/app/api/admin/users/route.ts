import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import crypto from 'crypto'

function validateAdminToken(token: string): boolean {
  const secret = process.env.ADMIN_SECRET || 'agir-admin-secret-2026'
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [timestamp, hash] = parts
  const expectedHash = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  if (hash !== expectedHash) return false
  const age = Date.now() - parseInt(timestamp)
  return age < 24 * 60 * 60 * 1000
}

function checkAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value
  return !!token && validateAdminToken(token)
}

// GET - listar usuarios com assinaturas
export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('search') || ''

  const supabase = createServerClient()

  // Total count
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Buscar perfis com assinaturas
  let query = supabase
    .from('profiles')
    .select(`
      *,
      subscriptions (id, status, plan, starts_at, expires_at)
    `)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: profiles, error } = await query
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: profiles || [], totalCount: count || 0 })
}

// PATCH - atualizar usuario (role, assinatura, etc)
export async function PATCH(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { action, userId } = body

  if (!userId || !action) {
    return NextResponse.json({ error: 'Parametros invalidos' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Trocar role
  if (action === 'toggle_admin') {
    const { currentRole } = body
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, newRole })
  }

  // Ativar assinatura
  if (action === 'activate_subscription') {
    const { plan, months } = body
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + (months || 12))

    // Cancelar assinatura anterior
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', userId)
      .eq('status', 'active')

    // Criar nova
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'active',
        plan: plan || 'standard',
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_gateway: 'manual_admin',
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Estender assinatura
  if (action === 'extend_subscription') {
    const { subscriptionId, months, currentExpiresAt } = body

    const currentExpires = new Date(currentExpiresAt)
    const now = new Date()
    const baseDate = currentExpires > now ? currentExpires : now
    const newExpiresAt = new Date(baseDate)
    newExpiresAt.setMonth(newExpiresAt.getMonth() + (months || 12))

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        expires_at: newExpiresAt.toISOString(),
      })
      .eq('id', subscriptionId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Acao desconhecida' }, { status: 400 })
}
