'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { validateSession, updateSessionActivity } from '@/lib/session'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  hasActiveSubscription: boolean
  sessionValid: boolean
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    hasActiveSubscription: false,
    sessionValid: true,
  })

  // Ref para controlar o intervalo de validação de sessão
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // Buscar perfil do usuário
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1)

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return (data && data.length > 0 ? data[0] : null) as Profile | null
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [])

  // Verificar assinatura ativa
  const checkSubscription = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .limit(1)

      if (error) {
        console.error('Error checking subscription:', error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.error('Error checking subscription:', error)
      return false
    }
  }, [])

  // Validar sessão e fazer logout se inválida
  const checkSessionValidity = useCallback(async (userId: string) => {
    const isValid = await validateSession(userId)

    if (!isValid) {
      setState(prev => ({ ...prev, sessionValid: false }))
      toast.error('Sua sessão foi encerrada pois você fez login em outro dispositivo')

      // Limpar sessão local e fazer logout
      clearLocalSession()
      await supabase.auth.signOut()
      router.push('/login')
      return false
    }

    // Atualizar última atividade
    await updateSessionActivity(userId)
    return true
  }, [router])

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true

    // Timeout de seguranca - nunca ficar travado em loading
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        setState(prev => {
          if (prev.isLoading) {
            console.log('useAuth: Safety timeout triggered, forcing isLoading to false')
            return { ...prev, isLoading: false }
          }
          return prev
        })
      }
    }, 8000) // 8 segundos de timeout maximo

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          // Buscar perfil em paralelo com timeout
          let profile = null
          let hasActiveSubscription = false

          try {
            const profilePromise = fetchProfile(session.user.id)
            const subscriptionPromise = checkSubscription(session.user.id)

            // Timeout de 5 segundos para não travar
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )

            const results = await Promise.race([
              Promise.all([profilePromise, subscriptionPromise]),
              timeoutPromise
            ]) as [any, boolean]

            profile = results[0]
            hasActiveSubscription = results[1]
          } catch (err) {
            console.error('Error fetching profile/subscription:', err)
          }

          if (!mounted) return

          const isAdmin = profile?.role === 'admin'

          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isAuthenticated: true,
            isAdmin,
            hasActiveSubscription,
            sessionValid: true,
          })
        } else {
          if (mounted) {
            setState(prev => ({ ...prev, isLoading: false }))
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      }
    }

    initAuth()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state change:', event)

        if (event === 'SIGNED_IN' && session?.user) {
          let profile = null
          let hasActiveSubscription = false

          try {
            profile = await fetchProfile(session.user.id)
            hasActiveSubscription = await checkSubscription(session.user.id)
          } catch (err) {
            console.error('Error in auth state change:', err)
          }

          if (!mounted) return

          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isAuthenticated: true,
            isAdmin: profile?.role === 'admin',
            hasActiveSubscription,
            sessionValid: true,
          })
        } else if (event === 'SIGNED_OUT') {
          if (!mounted) return

          setState({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            hasActiveSubscription: false,
            sessionValid: true,
          })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Atualizar sessao sem mudar o resto do estado
          if (!mounted) return
          setState(prev => ({
            ...prev,
            session,
            user: session.user,
          }))
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current)
      }
    }
  }, [fetchProfile, checkSubscription, checkSessionValidity])

  // Login com email/senha
  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }))

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }

    setState(prev => ({ ...prev, isLoading: false }))
    return data
  }

  // Cadastro
  const signUp = async (email: string, password: string, fullName?: string) => {
    setState(prev => ({ ...prev, isLoading: true }))

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }

    return data
  }

  // Logout
  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    // Limpar intervalo de verificação
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current)
      sessionCheckInterval.current = null
    }

    // Limpar localStorage de sessão
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session_token')
      localStorage.removeItem('device_id')
    }

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }

    setState({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      hasActiveSubscription: false,
      sessionValid: true,
    })

    router.push('/login')
  }

  // Reset de senha
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
  }

  // Atualizar senha
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  }

  // Atualizar perfil
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', state.user.id)
      .select()
      .single()

    if (error) throw error

    setState(prev => ({
      ...prev,
      profile: data as Profile,
    }))

    return data as Profile
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile: () => state.user && fetchProfile(state.user.id),
  }
}
