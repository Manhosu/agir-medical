'use client'

import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'

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
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<any>
  sendMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>
  refreshProfile: () => Promise<void>
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

// Helper to fetch profile with timeout
const fetchProfile = async (userId: string, timeoutMs = 3000): Promise<Profile | null> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .abortSignal(controller.signal)

    clearTimeout(timeoutId)

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return (data && data.length > 0 ? data[0] : null) as Profile | null
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('Profile fetch timed out')
    } else {
      console.error('Error fetching profile:', error)
    }
    return null
  }
}

// Helper to check subscription with timeout
const checkSubscription = async (userId: string, timeoutMs = 3000): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .abortSignal(controller.signal)

    clearTimeout(timeoutId)

    if (error) {
      console.error('Error checking subscription:', error)
      return false
    }

    return data && data.length > 0
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('Subscription check timed out')
    } else {
      console.error('Error checking subscription:', error)
    }
    return false
  }
}

// Flag to track if auth listener is already set up
let authListenerSetup = false

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  hasActiveSubscription: false,
  initialized: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Initialize authentication
  initialize: async () => {
    // Only initialize once
    if (get().initialized) return

    // Set up auth listener only once (outside the try-catch to always run)
    if (!authListenerSetup) {
      authListenerSetup = true
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event)

        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch profile and subscription in parallel with timeouts
          const [profile, hasActiveSubscription] = await Promise.all([
            fetchProfile(session.user.id),
            checkSubscription(session.user.id)
          ])

          set({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isAuthenticated: true,
            isAdmin: profile?.role === 'admin',
            hasActiveSubscription,
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
          set({
            session,
            user: session.user,
          })
        }
      })
    }

    try {
      // Get session with a timeout
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 5000)
      )

      let session: Session | null = null
      try {
        const result = await Promise.race([sessionPromise, timeoutPromise])
        session = result.data.session
      } catch (err) {
        console.warn('Session fetch timed out or failed, continuing without session')
        set({ isLoading: false, initialized: true })
        return
      }

      if (session?.user) {
        // Fetch profile and subscription in parallel
        const [profile, hasActiveSubscription] = await Promise.all([
          fetchProfile(session.user.id),
          checkSubscription(session.user.id)
        ])

        const isAdmin = profile?.role === 'admin'

        set({
          user: session.user,
          profile,
          session,
          isLoading: false,
          isAuthenticated: true,
          isAdmin,
          hasActiveSubscription,
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

  // Sign in
  signIn: async (email: string, password: string) => {
    set({ isLoading: true })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ isLoading: false })
        throw error
      }

      // Don't set isLoading to false here - let onAuthStateChange handle it
      return data
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  // Sign up
  signUp: async (email: string, password: string, fullName?: string, phone?: string) => {
    set({ isLoading: true })

    try {
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

      set({ isLoading: false })
      return data
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  // Send magic link for passwordless login
  sendMagicLink: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
  },

  // Sign out
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

  // Reset password
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  },

  // Update profile
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

    // Update the profile in the store
    set({ profile: data as Profile })

    return data as Profile
  },

  // Refresh profile from database
  refreshProfile: async () => {
    const { user } = get()
    if (!user) return

    const profile = await fetchProfile(user.id)
    if (profile) {
      set({
        profile,
        isAdmin: profile.role === 'admin'
      })
    }
  },
}))
