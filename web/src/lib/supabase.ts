import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Cliente Supabase para uso no browser/cliente (com suporte a cookies)
// Os tipos serão adicionados depois de criar as tabelas no Supabase
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Cliente para uso no servidor (com service role key)
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(supabaseUrl, supabaseServiceKey)
}
