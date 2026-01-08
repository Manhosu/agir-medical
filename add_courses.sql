-- Script para adicionar cursos médicos ao sistema AGIR
-- Execute este SQL no Supabase SQL Editor

-- Inserir cursos médicos baseados nos arquivos DOCX
-- Deixando VOLVO DE SIGMÓIDE e Ureterolitiase para adicionar manualmente

INSERT INTO courses (title, description, is_published, created_at, updated_at)
VALUES
  ('Abdome Agudo Obstrutivo - Bridas', 'Guideline completo sobre abdome agudo obstrutivo por bridas, incluindo diagnóstico, manejo e tratamento.', true, NOW(), NOW()),
  ('Abdome Agudo Perfurativo', 'Abordagem diagnóstica e terapêutica do abdome agudo perfurativo.', true, NOW(), NOW()),
  ('Abscesso Hepático', 'Diagnóstico e tratamento de abscessos hepáticos piogênicos e amebianos.', true, NOW(), NOW()),
  ('Antibioticoterapia na Colecistite e Colangite Aguda', 'Protocolos de antibioticoterapia para colecistite aguda e colangite aguda.', true, NOW(), NOW()),
  ('Apendicite Aguda', 'Diagnóstico, classificação e manejo da apendicite aguda.', true, NOW(), NOW()),
  ('Colangite Aguda', 'Abordagem da colangite aguda segundo guidelines atuais.', true, NOW(), NOW()),
  ('Colecistite Aguda', 'Diagnóstico e tratamento da colecistite aguda calculosa e acalculosa.', true, NOW(), NOW()),
  ('Diverticulite Aguda', 'Classificação, diagnóstico e manejo da diverticulite aguda.', true, NOW(), NOW()),
  ('Doença do Refluxo Gastroesofágico', 'DRGE: fisiopatologia, diagnóstico e tratamento clínico e cirúrgico.', true, NOW(), NOW()),
  ('Doença Inflamatória Pélvica', 'Diagnóstico e tratamento da doença inflamatória pélvica.', true, NOW(), NOW()),
  ('Dor Abdominal', 'Abordagem sistemática da dor abdominal aguda e crônica.', true, NOW(), NOW()),
  ('Hérnias Inguinais', 'Classificação, diagnóstico e técnicas cirúrgicas para hérnias inguinais.', true, NOW(), NOW()),
  ('Hérnia Umbilical', 'Manejo e tratamento cirúrgico da hérnia umbilical.', true, NOW(), NOW()),
  ('Isquemia Mesentérica', 'Diagnóstico e tratamento da isquemia mesentérica aguda e crônica.', true, NOW(), NOW()),
  ('Linfadenite Mesentérica', 'Diagnóstico diferencial e manejo da linfadenite mesentérica.', true, NOW(), NOW()),
  ('Pancreatite Aguda', 'Classificação, diagnóstico e tratamento da pancreatite aguda.', true, NOW(), NOW()),
  ('Síndrome de Ogilvie', 'Pseudo-obstrução colônica aguda: diagnóstico e tratamento.', true, NOW(), NOW());

-- Verificar cursos inseridos
SELECT id, title, is_published FROM courses ORDER BY title;
