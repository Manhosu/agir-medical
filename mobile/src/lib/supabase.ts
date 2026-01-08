import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Database } from '../types/database'

// Configuracoes do Supabase
const supabaseUrl = 'https://vypufynvscagvrhhsxxl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cHVmeW52c2NhZ3ZyaGhzeHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzYxNDYsImV4cCI6MjA4MzIxMjE0Nn0.udRJ3cIgO_6Np0v7uUjU9m05nITTqCmM3Cv_ldXIY6Q'

// Cliente Supabase configurado para React Native com AsyncStorage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
