'use client'

// =================================================================
// SESSAO GERENCIADA PELO SUPABASE
// =================================================================
// Este arquivo foi simplificado porque o Supabase ja gerencia sessoes
// de forma robusta e escalavel atraves de:
// - supabase.auth.getSession()
// - supabase.auth.onAuthStateChange()
//
// O sistema anterior usava localStorage que e COMPARTILHADO entre
// todas as abas do mesmo dominio, causando conflitos quando
// multiplos usuarios faziam login em abas diferentes.
//
// Agora cada aba/navegador gerencia sua propria sessao atraves
// do Supabase, que usa cookies httpOnly seguros.
// =================================================================

// Funcao utilitaria para obter device ID (por aba, nao global)
export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''

  // Usar sessionStorage (por aba) ao inves de localStorage (global)
  let deviceId = sessionStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    sessionStorage.setItem('device_id', deviceId)
  }
  return deviceId
}

// Limpar dados locais de sessao
export function clearLocalSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('device_id')
}
