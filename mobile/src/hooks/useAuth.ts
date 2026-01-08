import { useAuthStore } from '../stores/authStore'

// Hook simplificado que expõe o store de autenticação
export function useAuth() {
  const store = useAuthStore()
  return store
}

export default useAuth
