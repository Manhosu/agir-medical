import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, cpf, email, plan, user_id } = body

    if (!full_name || !cpf || !plan) {
      return NextResponse.json(
        { error: 'Nome completo, CPF e plano sao obrigatorios' },
        { status: 400 }
      )
    }

    // Validar CPF (11 digitos)
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      return NextResponse.json(
        { error: 'CPF invalido' },
        { status: 400 }
      )
    }

    // Determinar valor baseado no plano
    const amount = plan === 'premium' ? 95880 : 59880 // em centavos

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('pix_payments')
      .insert({
        user_id: user_id || null,
        full_name: full_name.trim(),
        cpf: cleanCpf,
        email: email?.toLowerCase().trim() || null,
        plan,
        amount,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao salvar pagamento PIX:', error)
      return NextResponse.json(
        { error: 'Erro ao registrar pagamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Erro na API pix-payment:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
