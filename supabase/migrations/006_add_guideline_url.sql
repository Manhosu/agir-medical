-- Add guideline_url column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS guideline_url TEXT;

-- Populate guideline URLs from Lovable published projects
UPDATE public.courses SET guideline_url = CASE slug
  WHEN 'abdome-agudo-obstrutivo-bridas' THEN 'https://bridas.lovable.app'
  WHEN 'abdome-agudo-perfurativo' THEN 'https://perfurativo-agir.lovable.app'
  WHEN 'abscesso-hepatico' THEN 'https://hepaticabscess-agir.lovable.app'
  WHEN 'antibioticoterapia-nas-colecistite-e-colangite-agudas' THEN 'https://tratamentocolecistitecolangi.lovable.app'
  WHEN 'apendicite-aguda' THEN 'https://apendiciteaguda-agir.lovable.app'
  WHEN 'colangite-aguda' THEN 'https://colangiteaguda-agir.lovable.app'
  WHEN 'colecistite-aguda' THEN 'https://agircolecistiteaguda.lovable.app'
  WHEN 'diverticulite-aguda' THEN 'https://diverticuliteaguda-agir.lovable.app'
  WHEN 'doenca-do-refluxo-gastroesofagico' THEN 'https://drge-agir.lovable.app'
  WHEN 'doenca-inflamatoria-pelvica' THEN 'https://dipa-agir.lovable.app'
  WHEN 'dor-abdominal-avaliacao-sistematica' THEN 'https://dorabdominal-agir.lovable.app'
  WHEN 'hernias-inguinais' THEN 'https://herniainguinal-agir.lovable.app'
  WHEN 'hernia-umbilical' THEN 'https://herniaumbilical-agir.lovable.app'
  WHEN 'isquemia-mesenterica' THEN 'https://isquemiamesenterica-agir.lovable.app'
  WHEN 'linfadenite-mesenterica' THEN 'https://linfadenitemesenterica-agir.lovable.app'
  WHEN 'pancreatite-aguda' THEN 'https://pancreatiteaguda-agir.lovable.app'
  WHEN 'sindrome-de-ogilvie' THEN 'https://sindromeogilvie-agir.lovable.app'
  WHEN 'ureterolitiase' THEN 'https://ureterolitiase-agir.lovable.app'
  WHEN 'volvo-de-sigmoide' THEN 'https://volvosigmoide-agir.lovable.app'
  ELSE guideline_url
END;
