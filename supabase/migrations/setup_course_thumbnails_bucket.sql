-- ============================================
-- CONFIGURAR BUCKET PARA THUMBNAILS DE CURSOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Criar bucket para thumbnails de cursos (se nao existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Admins can upload course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update course thumbnails" ON storage.objects;

-- 3. Politica: Admins podem fazer upload
CREATE POLICY "Admins can upload course thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-thumbnails' AND
  public.is_admin()
);

-- 4. Politica: Qualquer um pode ver (publico)
CREATE POLICY "Anyone can view course thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-thumbnails');

-- 5. Politica: Admins podem atualizar
CREATE POLICY "Admins can update course thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-thumbnails' AND
  public.is_admin()
);

-- 6. Politica: Admins podem deletar
CREATE POLICY "Admins can delete course thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-thumbnails' AND
  public.is_admin()
);

-- ============================================
-- VERIFICAR SE A FUNCAO is_admin EXISTE
-- ============================================
-- Se der erro nas policies acima, execute isso primeiro:

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
