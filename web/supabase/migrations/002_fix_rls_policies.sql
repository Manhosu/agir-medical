-- =====================================================
-- FIX: RLS Policies com recursão infinita
-- Execute este SQL no Editor SQL do Supabase
-- =====================================================

-- =====================================================
-- PROFILES: Corrigir políticas RLS
-- =====================================================

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Criar função segura para verificar se é admin (evita recursão)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Novas políticas para profiles (sem recursão)
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- SUBSCRIPTIONS: Corrigir políticas RLS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;

-- Novas políticas para subscriptions
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_admin_all"
  ON public.subscriptions FOR ALL
  USING (public.is_admin());

-- =====================================================
-- ACTIVE_SESSIONS: Verificar/Corrigir políticas
-- =====================================================

DROP POLICY IF EXISTS "Users can view own sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.active_sessions;

CREATE POLICY "sessions_select_own"
  ON public.active_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sessions_insert_own"
  ON public.active_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sessions_update_own"
  ON public.active_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "sessions_delete_own"
  ON public.active_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER_PROGRESS: Verificar/Corrigir políticas
-- =====================================================

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;

CREATE POLICY "progress_select_own"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "progress_insert_own"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_update_own"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- COURSES: Políticas públicas para leitura
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;

CREATE POLICY "courses_select_published"
  ON public.courses FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "courses_admin_all"
  ON public.courses FOR ALL
  USING (public.is_admin());

-- =====================================================
-- LESSONS: Políticas públicas para leitura
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;

CREATE POLICY "lessons_select_published"
  ON public.lessons FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "lessons_admin_all"
  ON public.lessons FOR ALL
  USING (public.is_admin());

-- =====================================================
-- LESSON_CONTENT: Políticas para conteúdo
-- =====================================================

DROP POLICY IF EXISTS "Users with subscription can view content" ON public.lesson_content;
DROP POLICY IF EXISTS "Admins can manage content" ON public.lesson_content;

-- Função para verificar assinatura ativa
CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid()
    AND status = 'active'
    AND expires_at > NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE POLICY "content_select_subscribers"
  ON public.lesson_content FOR SELECT
  USING (public.has_active_subscription() OR public.is_admin());

CREATE POLICY "content_admin_all"
  ON public.lesson_content FOR ALL
  USING (public.is_admin());

-- =====================================================
-- Garantir que o trigger de criação de perfil existe
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
