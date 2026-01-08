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
  hasActiveSubscription: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Estado inicial
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  hasActiveSubscription: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Inicializar autenticação
  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Buscar perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Verificar assinatura ativa
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .single()

        set({
          user: session.user,
          profile: profile as Profile | null,
          session,
          isLoading: false,
          isAuthenticated: true,
          hasActiveSubscription: !!subscription,
        })
      } else {
        set({ isLoading: false })
      }

      // Listener para mudanças de auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event)

        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .single()

          set({
            user: session.user,
            profile: profile as Profile | null,
            session,
            isLoading: false,
            isAuthenticated: true,
            hasActiveSubscription: !!subscription,
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            hasActiveSubscription: false,
          })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Atualizar sessão sem mudar o resto do estado
          set(prev => ({
            ...prev,
            session,
            user: session.user,
          }))
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ isLoading: false })
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

    set({ isLoading: false })
  },

  // Cadastro
  signUp: async (email: string, password: string, fullName?: string) => {
    set({ isLoading: true })

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      set({ isLoading: false })
      throw error
    }

    set({ isLoading: false })
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

    set({ profile: data as Profile })
  },
}))
