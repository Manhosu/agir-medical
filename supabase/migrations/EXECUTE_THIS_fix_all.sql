-- ============================================
-- CORRECAO COMPLETA - EXECUTE ESTE ARQUIVO
-- Supabase Dashboard > SQL Editor
-- ============================================

-- 1. CRIAR FUNCAO is_admin (SECURITY DEFINER para evitar recursao RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 2. BUCKET PARA THUMBNAILS DE CURSOS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Remover policies antigas de storage
DROP POLICY IF EXISTS "Admins can upload course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update course thumbnails" ON storage.objects;

-- Policies para storage
CREATE POLICY "Admins can upload course thumbnails"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-thumbnails' AND public.is_admin());

CREATE POLICY "Anyone can view course thumbnails"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Admins can update course thumbnails"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-thumbnails' AND public.is_admin());

CREATE POLICY "Admins can delete course thumbnails"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-thumbnails' AND public.is_admin());

-- ============================================
-- 3. POLICIES PARA TABELA COURSES
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
DROP POLICY IF EXISTS "Admins can update courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;

CREATE POLICY "Anyone can view published courses"
ON courses FOR SELECT TO public
USING (is_published = true);

CREATE POLICY "Admins can view all courses"
ON courses FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert courses"
ON courses FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update courses"
ON courses FOR UPDATE TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete courses"
ON courses FOR DELETE TO authenticated
USING (public.is_admin());

-- ============================================
-- 4. REMOVER CURSOS VAZIOS (SEM CONTEUDO)
-- ============================================

DELETE FROM courses WHERE id IN (
  '21c28c2d-58f7-438c-97b0-49ac3f36514d',  -- Infarto Agudo do Miocardio
  'c296ef47-51fa-4ea8-9186-850c8dcd6ecc'   -- Sepse e Choque Septico
);

-- ============================================
-- 5. VERIFICACAO
-- ============================================

SELECT 'Buckets:' as info;
SELECT id, name, public FROM storage.buckets WHERE id = 'course-thumbnails';

SELECT 'Courses policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'courses';

SELECT 'Storage policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%course%';
