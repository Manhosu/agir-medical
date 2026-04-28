import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types/database'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  hasActiveSubscription: boolean
  initialized: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<void>
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

// Helper para buscar com timeout
const fetchWithTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 3000
): Promise<T | null> => {
  try {
    const result = await Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      ),
    ])
    return result
  } catch (error: any) {
    if (error.message === 'Timeout') {
      console.warn('Request timed out')
    } else {
      console.error('Request error:', error)
    }
    return null
  }
}

// Flag para evitar multiplos listeners
let authListenerSetup = false

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Estado inicial
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  hasActiveSubscription: false,
  initialized: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Inicializar autenticacao
  initialize: async () => {
    // Evitar inicializacao dupla
    if (get().initialized) return

    // Configurar listener apenas uma vez
    if (!authListenerSetup) {
      authListenerSetup = true
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event)

        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          // Buscar perfil com timeout
          const profileResult = await fetchWithTimeout(
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single(),
            3000
          )
          const profile = profileResult?.data as Profile | null

          // Buscar assinatura com timeout
          const subscriptionResult = await fetchWithTimeout(
            supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('status', 'active')
              .gt('expires_at', new Date().toISOString())
              .single(),
            3000
          )

          set({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isAuthenticated: true,
            isAdmin: profile?.role === 'admin',
            hasActiveSubscription: !!subscriptionResult?.data,
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            hasActiveSubscription: false,
          })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          set(prev => ({
            ...prev,
            session,
            user: session.user,
          }))
        }
      })
    }

    try {
      // Buscar sessao com timeout de 5 segundos
      const sessionResult = await fetchWithTimeout(
        supabase.auth.getSession(),
        5000
      )

      if (!sessionResult) {
        console.warn('Session fetch timed out or failed')
        set({ isLoading: false, initialized: true })
        return
      }

      const session = sessionResult.data.session

      if (session?.user) {
        // Buscar perfil com timeout
        const profileResult = await fetchWithTimeout(
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single(),
          3000
        )
        const profile = profileResult?.data as Profile | null

        // Buscar assinatura com timeout
        const subscriptionResult = await fetchWithTimeout(
          supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .single(),
          3000
        )

        set({
          user: session.user,
          profile,
          session,
          isLoading: false,
          isAuthenticated: true,
          isAdmin: profile?.role === 'admin',
          hasActiveSubscription: !!subscriptionResult?.data,
          initialized: true,
        })
      } else {
        set({ isLoading: false, initialized: true })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ isLoading: false, initialized: true })
    }
  },

  // Login
  signIn: async (email: string, password: string) => {
    set({ isLoading: true })

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ isLoading: false })
      throw error
    }

    // Nao setar isLoading false aqui - deixar o onAuthStateChange fazer
  },

  // Cadastro
  signUp: async (email: string, password: string, fullName?: string, phone?: string) => {
    set({ isLoading: true })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    })

    if (error) {
      set({ isLoading: false })
      throw error
    }

    // Save phone to profile after signup
    if (phone && data.user) {
      await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', data.user.id)
    }

    // Nao setar isLoading false aqui - deixar o onAuthStateChange fazer
  },

  // Enviar OTP por email
  sendOtp: async (email: string) => {
    // Bypass para conta de revisao Apple - nao envia email real
    if (email.toLowerCase().trim() === 'apple.review@programa-agir.com.br') {
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) throw error
  },

  // Verificar OTP
  verifyOtp: async (email: string, token: string) => {
    set({ isLoading: true })

    const normalizedEmail = email.toLowerCase().trim()

    // Bypass para conta de revisao Apple
    if (normalizedEmail === 'apple.review@programa-agir.com.br' && token === '123456') {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: 'AppleReview2026!',
      })

      if (error) {
        set({ isLoading: false })
        throw error
      }
      return
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      set({ isLoading: false })
      throw error
    }

    // Nao setar isLoading false aqui - deixar o onAuthStateChange fazer
  },

  // Logout
  signOut: async () => {
    set({ isLoading: true })

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }

    set({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      hasActiveSubscription: false,
    })
  },

  // Recuperar senha
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  },

  // Atualizar perfil
  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    const profile = data as Profile
    set({
      profile,
      isAdmin: profile?.role === 'admin',
    })
  },
}))
