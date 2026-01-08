// Script para criar assinatura de teste
// Execute com: node scripts/create-subscription.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variaveis de ambiente nao encontradas')
  console.log('Certifique-se de ter SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSubscription() {
  const email = 'eduardogelista@gmail.com'

  // Buscar usuario pelo email
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', email)
    .limit(1)

  if (userError) {
    console.error('Erro ao buscar usuario:', userError)
    process.exit(1)
  }

  if (!users || users.length === 0) {
    console.error('Usuario nao encontrado com email:', email)
    process.exit(1)
  }

  const user = users[0]
  console.log('Usuario encontrado:', user.full_name, '- ID:', user.id)

  // Verificar se ja tem assinatura ativa
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)

  if (existingSub && existingSub.length > 0) {
    console.log('Usuario ja possui assinatura ativa!')
    console.log('Assinatura:', existingSub[0])
    process.exit(0)
  }

  // Criar assinatura de teste (1 ano)
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      plan: 'annual',
      status: 'active',
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (subError) {
    console.error('Erro ao criar assinatura:', subError)
    process.exit(1)
  }

  console.log('Assinatura criada com sucesso!')
  console.log('Detalhes:', subscription)
  console.log('\nExpira em:', expiresAt.toLocaleDateString('pt-BR'))
}

createSubscription()
