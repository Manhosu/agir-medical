'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const router = useRouter()
  const store = useAuthStore()

  // Initialize auth on first render
  useEffect(() => {
    store.initialize()
  }, [])

  // Add signOut that redirects (using hard reload for reliability)
  const signOut = async () => {
    await store.signOut()
    window.location.href = '/login'
  }

  return {
    user: store.user,
    profile: store.profile,
    session: store.session,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.isAdmin,
    hasActiveSubscription: store.hasActiveSubscription,
    sessionValid: store.sessionValid,
    signIn: store.signIn,
    signUp: store.signUp,
    signOut,
    resetPassword: store.resetPassword,
    updatePassword: store.updatePassword,
    updateProfile: store.updateProfile,
    refreshProfile: store.refreshProfile,
  }
}
