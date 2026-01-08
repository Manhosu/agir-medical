/**
 * Script para importar cursos dos arquivos DOCX
 * Converte DOCX para HTML e insere no Supabase
 */

const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase - usar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não configuradas');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'OK' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Pasta com os arquivos DOCX
const DOCS_FOLDER = path.join(__dirname, '../../pdfs');

// Arquivos para pular (deixar para adicionar manualmente)
const SKIP_FILES = [
  'VOLVO DE SIGMÓIDE.docx',
  'Ureterolitiase.docx',
  'PROGRAMA AGIR - SITE.docx',
  'Projeto Aplicativo e Site.docx'
];

// Função para criar slug a partir do título
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
}

// Função para converter DOCX para HTML
async function convertDocxToHtml(filePath) {
  try {
    const result = await mammoth.convertToHtml({ path: filePath }, {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "b => strong",
        "i => em",
        "u => u",
        "table => table.content-table",
      ]
    });

    // Adicionar classes CSS para estilização
    let html = result.value;

    // Wrap em div com classe
    html = `<div class="lesson-content prose prose-lg max-w-none">${html}</div>`;

    return html;
  } catch (error) {
    console.error(`Erro ao converter ${filePath}:`, error);
    return null;
  }
}

// Função para extrair título do nome do arquivo
function getTitleFromFilename(filename) {
  // Remove extensão e limpa o nome
  let title = filename.replace('.docx', '').replace('.DOCX', '');

  // Ajustes específicos
  title = title.replace(' - AGIR', '');
  title = title.replace(' 1', '');
  title = title.replace('ABDOMEM', 'Abdome');
  title = title.replace('HÉRNIA INGUINAIS', 'Hérnias Inguinais');
  title = title.replace('DOENÇA INFLAMATORIA', 'Doença Inflamatória');

  // Capitalizar corretamente
  title = title.split(' ').map(word => {
    if (['de', 'do', 'da', 'dos', 'das', 'e', 'na', 'no'].includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  // Primeira letra sempre maiúscula
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return title;
}

// Função para obter descrição baseada no título
function getDescription(title) {
  const descriptions = {
    'Abdome Agudo Obstrutivo - Bridas': 'Guideline completo sobre abdome agudo obstrutivo por bridas, incluindo diagnóstico, manejo e tratamento.',
    'Abdome Agudo Perfurativo': 'Abordagem diagnóstica e terapêutica do abdome agudo perfurativo.',
    'Abscesso Hepático': 'Diagnóstico e tratamento de abscessos hepáticos piogênicos e amebianos.',
    'Antibioticoterapia na Colecistite Aguda e na Colangite Aguda': 'Protocolos de antibioticoterapia para colecistite aguda e colangite aguda.',
    'Apendicite Aguda': 'Diagnóstico, classificação e manejo da apendicite aguda.',
    'Colangite Aguda': 'Abordagem da colangite aguda segundo guidelines atuais.',
    'Colecistite Aguda': 'Diagnóstico e tratamento da colecistite aguda calculosa e acalculosa.',
    'Diverticulite Aguda': 'Classificação, diagnóstico e manejo da diverticulite aguda.',
    'Doença do Refluxo Gastroesofágico': 'DRGE: fisiopatologia, diagnóstico e tratamento clínico e cirúrgico.',
    'Doença Inflamatória Pélvica': 'Diagnóstico e tratamento da doença inflamatória pélvica.',
    'Dor Abdominal': 'Abordagem sistemática da dor abdominal aguda e crônica.',
    'Hérnias Inguinais': 'Classificação, diagnóstico e técnicas cirúrgicas para hérnias inguinais.',
    'Hérnia Umbilical': 'Manejo e tratamento cirúrgico da hérnia umbilical.',
    'Isquemia Mesentérica': 'Diagnóstico e tratamento da isquemia mesentérica aguda e crônica.',
    'Linfadenite Mesentérica': 'Diagnóstico diferencial e manejo da linfadenite mesentérica.',
    'Pancreatite Aguda': 'Classificação, diagnóstico e tratamento da pancreatite aguda.',
    'Síndrome de Ogilvie': 'Pseudo-obstrução colônica aguda: diagnóstico e tratamento.',
  };

  // Busca por título similar
  for (const [key, desc] of Object.entries(descriptions)) {
    if (title.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
      return desc;
    }
  }

  return `Guideline completo sobre ${title.toLowerCase()}.`;
}

// Função principal
async function importCourses() {
  console.log('Iniciando importação de cursos...\n');

  // Verificar se a pasta existe
  if (!fs.existsSync(DOCS_FOLDER)) {
    console.error(`Pasta não encontrada: ${DOCS_FOLDER}`);
    process.exit(1);
  }

  // Listar arquivos DOCX
  const files = fs.readdirSync(DOCS_FOLDER)
    .filter(f => f.endsWith('.docx') || f.endsWith('.DOCX'))
    .filter(f => !SKIP_FILES.includes(f));

  console.log(`Encontrados ${files.length} arquivos para importar:\n`);
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  console.log('\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(DOCS_FOLDER, filename);
    const title = getTitleFromFilename(filename);
    const slug = createSlug(title);
    const description = getDescription(title);

    console.log(`[${i + 1}/${files.length}] Processando: ${title}`);

    try {
      // 1. Converter DOCX para HTML
      const contentHtml = await convertDocxToHtml(filePath);
      if (!contentHtml) {
        console.log(`  ❌ Erro ao converter arquivo\n`);
        errorCount++;
        continue;
      }

      // 2. Criar o curso
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title,
          slug,
          description,
          is_published: true,
          order: i + 1
        })
        .select()
        .single();

      if (courseError) {
        // Tentar buscar curso existente
        if (courseError.code === '23505') { // Unique violation
          console.log(`  ⚠️ Curso já existe, pulando...`);
          continue;
        }
        throw courseError;
      }

      console.log(`  ✓ Curso criado: ${course.id}`);

      // 3. Criar a aula
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          course_id: course.id,
          title: title,
          slug: 'conteudo',
          description: description,
          order: 1,
          is_published: true,
          estimated_time: 30
        })
        .select()
        .single();

      if (lessonError) {
        throw lessonError;
      }

      console.log(`  ✓ Aula criada: ${lesson.id}`);

      // 4. Inserir o conteúdo HTML
      const { error: contentError } = await supabase
        .from('lesson_content')
        .insert({
          lesson_id: lesson.id,
          content_html: contentHtml,
          original_file_url: filename
        });

      if (contentError) {
        throw contentError;
      }

      console.log(`  ✓ Conteúdo inserido`);
      console.log(`  ✅ Sucesso!\n`);
      successCount++;

    } catch (error) {
      console.log(`  ❌ Erro: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`Importação concluída!`);
  console.log(`  ✅ Sucesso: ${successCount}`);
  console.log(`  ❌ Erros: ${errorCount}`);
  console.log(`  ⏭️ Pulados: ${SKIP_FILES.length}`);
  console.log('========================================\n');

  console.log('Arquivos deixados para adicionar manualmente:');
  SKIP_FILES.forEach(f => console.log(`  - ${f}`));
}

// Executar
importCourses().catch(console.error);
