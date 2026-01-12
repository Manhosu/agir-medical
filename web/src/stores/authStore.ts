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
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>
  refreshProfile: () => Promise<void>
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

// Helper to fetch profile
const fetchProfile = async (userId: string): Promise<Profile | null> => {
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
}

// Helper to check subscription
const checkSubscription = async (userId: string): Promise<boolean> => {
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
}

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

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        let profile = null
        let hasActiveSubscription = false

        try {
          const profilePromise = fetchProfile(session.user.id)
          const subscriptionPromise = checkSubscription(session.user.id)

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )

          const results = await Promise.race([
            Promise.all([profilePromise, subscriptionPromise]),
            timeoutPromise
          ]) as [Profile | null, boolean]

          profile = results[0]
          hasActiveSubscription = results[1]
        } catch (err) {
          console.error('Error fetching profile/subscription:', err)
        }

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

      // Listener for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
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
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ isLoading: false, initialized: true })
    }
  },

  // Sign in
  signIn: async (email: string, password: string) => {
    set({ isLoading: true })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ isLoading: false })
      throw error
    }

    set({ isLoading: false })
    return data
  },

  // Sign up
  signUp: async (email: string, password: string, fullName?: string) => {
    set({ isLoading: true })

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
      set({ isLoading: false })
      throw error
    }

    return data
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
