import { NextRequest, NextResponse } from 'next/server'
import {
  processInfinitePayPayment,
  validateWebhookSignature,
} from '@/lib/payments'

// Desabilitar body parser para poder validar a assinatura
export const runtime = 'nodejs'

/**
 * POST /api/webhooks/infinitepay
 *
 * Endpoint para receber notificacoes de pagamento do InfinitePay.
 *
 * Eventos tratados:
 * - invoice.paid: Pagamento confirmado
 * - invoice.payment_failed: Pagamento falhou
 * - invoice.expired: Invoice expirou
 */
export async function POST(request: NextRequest) {
  try {
    // Ler o body como texto para validar assinatura
    const rawBody = await request.text()

    // Validar assinatura do webhook (se configurada)
    const signature = request.headers.get('x-infinitepay-signature') ||
                      request.headers.get('x-webhook-signature')
    const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET || ''

    if (webhookSecret && !validateWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('Assinatura do webhook invalida')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse do JSON
    let payload
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    // Log do webhook recebido (para debug)
    console.log('Webhook InfinitePay recebido:', {
      event: payload.event || payload.status,
      id: payload.id,
      timestamp: new Date().toISOString(),
    })

    // Determinar o tipo de evento
    const eventType = payload.event || payload.status

    // Tratar eventos de pagamento
    switch (eventType) {
      case 'paid':
      case 'invoice.paid':
      case 'payment.approved':
      case 'approved': {
        const result = await processInfinitePayPayment(payload)

        if (result.success) {
          console.log('Pagamento processado:', result.message)
          return NextResponse.json({
            success: true,
            message: result.message,
            subscriptionId: result.subscriptionId,
          })
        } else {
          console.error('Erro ao processar pagamento:', result.error)
          // Retornar 200 mesmo em erro para evitar retentativas
          return NextResponse.json({
            success: false,
            message: result.message,
            error: result.error,
          })
        }
      }

      case 'failed':
      case 'invoice.payment_failed':
      case 'payment.failed':
      case 'refused': {
        console.log('Pagamento falhou:', payload.id)
        // Apenas logar - nao ha acao necessaria
        return NextResponse.json({
          success: true,
          message: 'Falha de pagamento registrada',
        })
      }

      case 'expired':
      case 'invoice.expired': {
        console.log('Invoice expirou:', payload.id)
        // Apenas logar - nao ha acao necessaria
        return NextResponse.json({
          success: true,
          message: 'Expiracao registrada',
        })
      }

      case 'pending':
      case 'invoice.created':
      case 'invoice.pending': {
        console.log('Invoice pendente:', payload.id)
        // Apenas logar - aguardar confirmacao
        return NextResponse.json({
          success: true,
          message: 'Evento pendente registrado',
        })
      }

      default: {
        console.log('Evento nao tratado:', eventType, payload.id)
        return NextResponse.json({
          success: true,
          message: `Evento ${eventType} recebido`,
        })
      }
    }
  } catch (error) {
    console.error('Erro no webhook InfinitePay:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/infinitepay
 *
 * Endpoint de verificacao - alguns gateways fazem GET para verificar se o endpoint existe
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'InfinitePay webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
