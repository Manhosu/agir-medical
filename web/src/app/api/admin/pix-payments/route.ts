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

// GET - listar pagamentos PIX
export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'

  const supabase = createServerClient()

  let query = supabase
    .from('pix_payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sempre retornar contagem de pendentes para o badge
  const { count: pendingCount } = await supabase
    .from('pix_payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return NextResponse.json({ payments: data, pendingCount: pendingCount || 0 })
}

// PATCH - aprovar ou rejeitar pagamento
export async function PATCH(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id, action } = await request.json()

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Parametros invalidos' }, { status: 400 })
  }

  const supabase = createServerClient()

  if (action === 'reject') {
    const { error } = await supabase
      .from('pix_payments')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  // Aprovar: buscar pagamento, criar assinatura
  const { data: payment, error: fetchError } = await supabase
    .from('pix_payments')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !payment) {
    return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
  }

  // Atualizar status
  const { error: updateError } = await supabase
    .from('pix_payments')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Se tem user_id, criar assinatura
  if (payment.user_id) {
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Cancelar assinatura anterior
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', payment.user_id)
      .eq('status', 'active')

    // Criar nova assinatura
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: payment.user_id,
        status: 'active',
        plan: payment.plan,
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_gateway: 'pix_manual',
      })

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }

    // Registrar no historico (ignora erro se tabela nao existir)
    await supabase
      .from('payment_history')
      .insert({
        user_id: payment.user_id,
        gateway: 'pix_manual',
        plan: payment.plan,
        amount: payment.amount,
        status: 'completed',
        paid_at: new Date().toISOString(),
        metadata: {
          pix_payment_id: payment.id,
          cpf: payment.cpf,
          full_name: payment.full_name,
        },
      })
      .then(() => {}) // ignora resultado

    return NextResponse.json({ success: true, subscription_created: true })
  }

  return NextResponse.json({ success: true, subscription_created: false })
}
