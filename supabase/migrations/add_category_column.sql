-- ============================================
-- ADICIONAR COLUNA CATEGORY NA TABELA COURSES
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================

-- Adicionar coluna category (se nao existir)
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS category TEXT;

-- Verificar colunas da tabela
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position;
