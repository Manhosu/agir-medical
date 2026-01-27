import { createServerClient } from './supabase'

// Tipos de planos disponiveis
export type PlanType = 'standard' | 'premium'

// Mapeamento dos IDs de invoice do InfinitePay para os planos
export const INFINITEPAY_INVOICE_MAP: Record<string, PlanType> = {
  '79t6sJUR6R': 'standard',
  '1myI0LkHxv': 'premium',
}

// Duracao da assinatura em dias
const SUBSCRIPTION_DURATION_DAYS = 365 // 12 meses

interface InfinitePayWebhookPayload {
  // Campos principais do webhook InfinitePay
  id: string
  status: string
  amount: number
  paid_amount?: number
  customer?: {
    name?: string
    email?: string
    document?: string // CPF
    phone?: string
  }
  payment?: {
    method?: string
    installments?: number
  }
  metadata?: Record<string, unknown>
  invoice_id?: string
  created_at?: string
  paid_at?: string
  // URL do invoice para extrair o ID
  invoice_url?: string
}

interface ProcessPaymentResult {
  success: boolean
  message: string
  subscriptionId?: string
  error?: string
}

/**
 * Processa um pagamento confirmado do InfinitePay
 */
export async function processInfinitePayPayment(
  payload: InfinitePayWebhookPayload
): Promise<ProcessPaymentResult> {
  const supabase = createServerClient()

  try {
    // Extrair informacoes do cliente
    const customerEmail = payload.customer?.email
    const customerCpf = payload.customer?.document

    if (!customerEmail && !customerCpf) {
      return {
        success: false,
        message: 'Email ou CPF do cliente nao encontrado no payload',
        error: 'MISSING_CUSTOMER_INFO',
      }
    }

    // Determinar o plano baseado no invoice
    const invoiceId = extractInvoiceId(payload)
    const plan = invoiceId ? INFINITEPAY_INVOICE_MAP[invoiceId] : null

    if (!plan) {
      console.warn('Invoice ID nao mapeado para um plano:', invoiceId)
      // Fallback: usar o valor para determinar o plano
      const amount = payload.paid_amount || payload.amount
      // Premium: R$ 1.147,00 = 114700 centavos, Standard: R$ 697,00 = 69700 centavos
      // Usar threshold de R$ 900,00 = 90000 centavos
      const determinedPlan: PlanType = amount >= 90000 ? 'premium' : 'standard'
      console.log(`Plano determinado pelo valor (${amount}): ${determinedPlan}`)
    }

    const finalPlan = plan || 'standard'

    // Buscar usuario pelo email ou CPF
    let userId: string | null = null

    if (customerEmail) {
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail.toLowerCase())
        .single()

      if (profileByEmail) {
        userId = profileByEmail.id
      }
    }

    if (!userId && customerCpf) {
      // Limpar CPF (remover pontos e tracos)
      const cleanCpf = customerCpf.replace(/\D/g, '')
      const { data: profileByCpf } = await supabase
        .from('profiles')
        .select('id')
        .eq('cpf', cleanCpf)
        .single()

      if (profileByCpf) {
        userId = profileByCpf.id
      }
    }

    if (!userId) {
      // Usuario nao encontrado - salvar pagamento pendente para vinculacao posterior
      const { error: pendingError } = await supabase
        .from('pending_payments')
        .insert({
          infinitepay_id: payload.id,
          customer_email: customerEmail?.toLowerCase(),
          customer_cpf: customerCpf?.replace(/\D/g, ''),
          customer_name: payload.customer?.name,
          customer_phone: payload.customer?.phone,
          plan: finalPlan,
          amount: payload.paid_amount || payload.amount,
          paid_at: payload.paid_at || new Date().toISOString(),
          payload: payload,
          status: 'pending_user',
        })

      if (pendingError) {
        console.error('Erro ao salvar pagamento pendente:', pendingError)
      }

      return {
        success: true,
        message: `Pagamento registrado. Usuario com email ${customerEmail} ou CPF ${customerCpf} nao encontrado. Sera vinculado quando o usuario se cadastrar.`,
      }
    }

    // Calcular datas da assinatura
    const startsAt = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DURATION_DAYS)

    // Verificar se ja existe uma assinatura ativa
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (existingSubscription) {
      // Estender a assinatura existente
      const currentExpiry = new Date(existingSubscription.expires_at)
      const newExpiry = new Date(
        Math.max(currentExpiry.getTime(), startsAt.getTime())
      )
      newExpiry.setDate(newExpiry.getDate() + SUBSCRIPTION_DURATION_DAYS)

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan: finalPlan,
          expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id)

      if (updateError) {
        throw updateError
      }

      // Registrar o pagamento
      await logPayment(supabase, {
        userId,
        subscriptionId: existingSubscription.id,
        infinitepayId: payload.id,
        plan: finalPlan,
        amount: payload.paid_amount || payload.amount,
        paidAt: payload.paid_at,
      })

      return {
        success: true,
        message: `Assinatura ${finalPlan.toUpperCase()} estendida ate ${newExpiry.toLocaleDateString('pt-BR')}`,
        subscriptionId: existingSubscription.id,
      }
    }

    // Criar nova assinatura
    const { data: newSubscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'active',
        plan: finalPlan,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_gateway: 'infinitepay',
        gateway_subscription_id: payload.id,
      })
      .select('id')
      .single()

    if (insertError) {
      throw insertError
    }

    // Registrar o pagamento
    await logPayment(supabase, {
      userId,
      subscriptionId: newSubscription.id,
      infinitepayId: payload.id,
      plan: finalPlan,
      amount: payload.paid_amount || payload.amount,
      paidAt: payload.paid_at,
    })

    return {
      success: true,
      message: `Assinatura ${finalPlan.toUpperCase()} ativada ate ${expiresAt.toLocaleDateString('pt-BR')}`,
      subscriptionId: newSubscription.id,
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error)
    return {
      success: false,
      message: 'Erro interno ao processar pagamento',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Extrai o ID do invoice da URL ou do campo invoice_id
 */
function extractInvoiceId(payload: InfinitePayWebhookPayload): string | null {
  // Tentar extrair do campo invoice_id
  if (payload.invoice_id) {
    return payload.invoice_id
  }

  // Tentar extrair da URL do invoice
  if (payload.invoice_url) {
    const match = payload.invoice_url.match(/\/([a-zA-Z0-9]+)\/?$/)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * Registra o pagamento no historico
 */
async function logPayment(
  supabase: ReturnType<typeof createServerClient>,
  data: {
    userId: string
    subscriptionId: string
    infinitepayId: string
    plan: PlanType
    amount: number
    paidAt?: string
  }
) {
  try {
    await supabase.from('payment_history').insert({
      user_id: data.userId,
      subscription_id: data.subscriptionId,
      gateway: 'infinitepay',
      gateway_payment_id: data.infinitepayId,
      plan: data.plan,
      amount: data.amount,
      currency: 'BRL',
      status: 'completed',
      paid_at: data.paidAt || new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao registrar historico de pagamento:', error)
    // Nao falhar o processo por erro no log
  }
}

/**
 * Vincula pagamentos pendentes a um usuario recem-cadastrado
 */
export async function linkPendingPayments(
  userId: string,
  email: string,
  cpf?: string
): Promise<void> {
  const supabase = createServerClient()

  try {
    // Buscar pagamentos pendentes pelo email ou CPF
    let query = supabase
      .from('pending_payments')
      .select('*')
      .eq('status', 'pending_user')

    const cleanEmail = email.toLowerCase()
    const cleanCpf = cpf?.replace(/\D/g, '')

    const { data: pendingPayments } = await query.or(
      `customer_email.eq.${cleanEmail}${cleanCpf ? `,customer_cpf.eq.${cleanCpf}` : ''}`
    )

    if (!pendingPayments || pendingPayments.length === 0) {
      return
    }

    // Processar cada pagamento pendente
    for (const payment of pendingPayments) {
      // Calcular datas da assinatura
      const startsAt = new Date()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DURATION_DAYS)

      // Criar assinatura
      const { data: subscription } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          status: 'active',
          plan: payment.plan,
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_gateway: 'infinitepay',
          gateway_subscription_id: payment.infinitepay_id,
        })
        .select('id')
        .single()

      if (subscription) {
        // Registrar pagamento
        await logPayment(supabase, {
          userId,
          subscriptionId: subscription.id,
          infinitepayId: payment.infinitepay_id,
          plan: payment.plan,
          amount: payment.amount,
          paidAt: payment.paid_at,
        })

        // Marcar como processado
        await supabase
          .from('pending_payments')
          .update({ status: 'linked', linked_user_id: userId })
          .eq('id', payment.id)
      }
    }
  } catch (error) {
    console.error('Erro ao vincular pagamentos pendentes:', error)
  }
}

/**
 * Valida a assinatura do webhook (se disponivel)
 */
export function validateWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    // Se nao houver secret configurado, aceitar (menos seguro)
    console.warn('Webhook secret nao configurado - aceitando sem validacao')
    return true
  }

  // InfinitePay usa HMAC-SHA256 para assinatura
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
