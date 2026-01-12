-- Remove courses without content (no DOCX files exist for these)
-- Run this in Supabase Dashboard > SQL Editor

DELETE FROM courses
WHERE id IN (
  '21c28c2d-58f7-438c-97b0-49ac3f36514d',  -- Infarto Agudo do Miocardio
  'c296ef47-51fa-4ea8-9186-850c8dcd6ecc'   -- Sepse e Choque Septico
);
