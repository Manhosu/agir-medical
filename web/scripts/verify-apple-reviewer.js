// Verifica se a conta de teste do Apple Reviewer esta funcionando corretamente.
// Roda os mesmos passos que o app mobile faz no login (bypass).

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('Missing env vars in .env.local')
  process.exit(1)
}

const REVIEWER_EMAIL = 'apple.review@programa-agir.com.br'
const REVIEWER_PASSWORD = 'AppleReview2026!'

async function main() {
  console.log('🔍 Verificando conta Apple Reviewer...\n')

  // 1) Tentar signInWithPassword usando ANON KEY (igual o mobile faz)
  const clientAuth = createClient(SUPABASE_URL, ANON_KEY)

  console.log('1️⃣  Tentando signInWithPassword (igual o mobile)...')
  const { data: signInData, error: signInError } = await clientAuth.auth.signInWithPassword({
    email: REVIEWER_EMAIL,
    password: REVIEWER_PASSWORD,
  })

  if (signInError) {
    console.error(`   ❌ FALHA: ${signInError.message}`)
    console.error(`   Status: ${signInError.status || 'N/A'}`)
    console.error('')
    console.error('   ⚠️  Esse e exatamente o erro que a Apple Reviewer pode ter visto.')
    process.exit(1)
  }

  const userId = signInData.user.id
  console.log(`   ✅ Login OK (User ID: ${userId})`)
  console.log(`   Email confirmado: ${signInData.user.email_confirmed_at ? 'Sim' : 'NAO'}`)
  console.log(`   Session token presente: ${signInData.session ? 'Sim' : 'NAO'}`)
  console.log('')

  // 2) Verificar profile
  console.log('2️⃣  Verificando profile...')
  const { data: profile, error: profileError } = await clientAuth
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    console.error(`   ❌ Profile nao encontrado: ${profileError?.message}`)
  } else {
    console.log(`   ✅ Profile OK (full_name: ${profile.full_name})`)
  }
  console.log('')

  // 3) Verificar assinatura (igual o mobile faz)
  console.log('3️⃣  Verificando assinatura ativa...')
  const nowIso = new Date().toISOString()
  const { data: subs, error: subError } = await clientAuth
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', nowIso)

  if (subError) {
    console.error(`   ❌ Erro ao buscar: ${subError.message}`)
  } else if (!subs || subs.length === 0) {
    console.error(`   ❌ NENHUMA assinatura ativa encontrada!`)
    console.error(`   ⚠️  Isso explica a "Acesso indisponivel" mensagem.`)
  } else {
    console.log(`   ✅ ${subs.length} assinatura(s) ativa(s) encontrada(s)`)
    subs.forEach((s, i) => {
      console.log(`      ${i + 1}. plan=${s.plan} | status=${s.status} | expires=${s.expires_at}`)
    })
  }
  console.log('')

  // 4) Listar TODAS as assinaturas (mesmo nao ativas) para diagnostico
  console.log('4️⃣  Listando TODAS as assinaturas do usuario (diagnostico)...')
  const { data: allSubs } = await clientAuth
    .from('subscriptions')
    .select('id, status, plan, starts_at, expires_at, payment_gateway, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!allSubs || allSubs.length === 0) {
    console.error(`   ❌ Usuario nao tem NENHUMA assinatura registrada`)
  } else {
    console.log(`   ${allSubs.length} assinatura(s) total:`)
    allSubs.forEach((s, i) => {
      const future = new Date(s.expires_at) > new Date()
      console.log(`      ${i + 1}. ${s.status.padEnd(10)} | ${s.plan.padEnd(10)} | exp=${s.expires_at.split('T')[0]} ${future ? '(futuro)' : '(passado)'} | gateway=${s.payment_gateway || 'N/A'}`)
    })
  }
  console.log('')

  // 5) Logout para nao deixar sessao aberta
  await clientAuth.auth.signOut()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Verificacao concluida')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(err => {
  console.error('💥 Erro inesperado:', err)
  process.exit(1)
})
