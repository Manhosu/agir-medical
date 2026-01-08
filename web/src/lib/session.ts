'use client'

import { supabase } from './supabase'

// Gera um ID único para o dispositivo
function generateDeviceId(): string {
  const storedId = localStorage.getItem('device_id')
  if (storedId) return storedId

  const newId = crypto.randomUUID()
  localStorage.setItem('device_id', newId)
  return newId
}

// Gera um token de sessão único
function generateSessionToken(): string {
  return crypto.randomUUID()
}

// Obtém informações do dispositivo
function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    // IP será preenchido pelo backend se necessário
    ipAddress: null
  }
}

export interface SessionInfo {
  deviceId: string
  sessionToken: string
  isValid: boolean
}

// Registra uma nova sessão (substitui a anterior devido ao UNIQUE constraint)
export async function registerSession(userId: string): Promise<SessionInfo> {
  const deviceId = generateDeviceId()
  const sessionToken = generateSessionToken()
  const deviceInfo = getDeviceInfo()

  // Armazenar token localmente
  localStorage.setItem('session_token', sessionToken)

  // Usar upsert para substituir sessão anterior (UNIQUE no user_id garante apenas 1)
  const { error } = await supabase
    .from('active_sessions')
    .upsert({
      user_id: userId,
      device_id: deviceId,
      session_token: sessionToken,
      last_activity: new Date().toISOString(),
      user_agent: deviceInfo.userAgent,
      ip_address: deviceInfo.ipAddress
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error registering session:', error)
    throw error
  }

  return {
    deviceId,
    sessionToken,
    isValid: true
  }
}

// Verifica se a sessão atual ainda é válida
export async function validateSession(userId: string): Promise<boolean> {
  const storedToken = localStorage.getItem('session_token')
  const deviceId = localStorage.getItem('device_id')

  // Se não há token local, a sessão precisa ser registrada (novo login)
  if (!storedToken || !deviceId) {
    // Registrar nova sessão automaticamente
    try {
      await registerSession(userId)
      return true
    } catch {
      return false
    }
  }

  const { data, error } = await supabase
    .from('active_sessions')
    .select('session_token, device_id')
    .eq('user_id', userId)
    .limit(1)

  // Se não há sessão no banco, registrar uma nova
  if (error || !data || data.length === 0) {
    try {
      await registerSession(userId)
      return true
    } catch {
      return false
    }
  }

  const sessionData = data[0]

  // Sessão é válida se o token e device_id correspondem
  const isValid = sessionData.session_token === storedToken && sessionData.device_id === deviceId

  return isValid
}

// Atualiza a última atividade da sessão
export async function updateSessionActivity(userId: string): Promise<void> {
  const storedToken = localStorage.getItem('session_token')

  if (!storedToken) return

  await supabase
    .from('active_sessions')
    .update({ last_activity: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('session_token', storedToken)
}

// Remove a sessão (logout)
export async function clearSession(userId: string): Promise<void> {
  const storedToken = localStorage.getItem('session_token')

  if (storedToken) {
    await supabase
      .from('active_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('session_token', storedToken)
  }

  localStorage.removeItem('session_token')
  localStorage.removeItem('device_id')
}

// Limpa dados locais de sessão (sem afetar o banco)
export function clearLocalSession(): void {
  localStorage.removeItem('session_token')
  localStorage.removeItem('device_id')
}
