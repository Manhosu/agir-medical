-- ============================================
-- CORRIGIR RLS POLICIES PARA TABELA COURSES
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- Verificar se is_admin existe
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Habilitar RLS na tabela courses (se ainda nao estiver)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
DROP POLICY IF EXISTS "Admins can update courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;

-- Politica: Qualquer um pode ver cursos publicados
CREATE POLICY "Anyone can view published courses"
ON courses FOR SELECT
TO public
USING (is_published = true);

-- Politica: Admins podem ver todos os cursos
CREATE POLICY "Admins can view all courses"
ON courses FOR SELECT
TO authenticated
USING (public.is_admin());

-- Politica: Admins podem inserir cursos
CREATE POLICY "Admins can insert courses"
ON courses FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Politica: Admins podem atualizar cursos
CREATE POLICY "Admins can update courses"
ON courses FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Politica: Admins podem deletar cursos
CREATE POLICY "Admins can delete courses"
ON courses FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================
-- VERIFICAR POLICIES APLICADAS
-- ============================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'courses';
