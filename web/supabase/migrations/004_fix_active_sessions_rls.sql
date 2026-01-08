-- =====================================================
-- Correção de RLS para active_sessions e configuração de admin
-- Execute este SQL no Editor SQL do Supabase
-- =====================================================

-- Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view own sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.active_sessions;

-- Criar políticas corrigidas
CREATE POLICY "Users can view own sessions"
  ON public.active_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.active_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.active_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.active_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Configurar usuário admin@agir.com como admin
-- IMPORTANTE: Primeiro crie o usuário no Supabase:
-- 1. Vá em Authentication > Users
-- 2. Clique em "Add user" > "Create new user"
-- 3. Email: admin@agir.com
-- 4. Password: Agir2026
-- 5. Depois execute este SQL
-- =====================================================

-- Definir admin@agir.com como admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@agir.com';

-- Se não existe profile para o admin, criar (depois que o usuário existir em auth.users)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Administrador AGIR', 'admin'
FROM auth.users
WHERE email = 'admin@agir.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verificar se funcionou
SELECT id, email, role FROM public.profiles WHERE role = 'admin';
