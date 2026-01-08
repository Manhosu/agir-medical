/**
 * Script para adicionar aulas faltantes aos cursos
 * Busca cursos sem aulas e cria uma aula com o conteudo do DOCX correspondente
 */

const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DOCS_FOLDER = path.join(__dirname, '../../pdfs');

// Mapeamento de cursos para arquivos DOCX
const courseToFileMap = {
  'Apendicite Aguda': 'APENDICITE AGUDA 1.docx',
  // 'Infarto Agudo do Miocárdio' - NAO TEM ARQUIVO
  // 'Sepse e Choque Séptico' - NAO TEM ARQUIVO
  'Colangite Aguda': 'Colangite Aguda.docx',
  'Colecistite Aguda': 'COLECISTITE AGUDA.docx',
  'Diverticulite Aguda': 'Diverticulite aguda.docx',
  'Pancreatite Aguda': 'Pancreatite Aguda.docx',
  'Hérnia Umbilical': 'hérnia umbilical.docx',
  'Hérnias Inguinais': 'HÉRNIA INGUINAIS.docx',
  'Abscesso Hepático': 'Abscesso Hepático.docx',
  'Isquemia Mesentérica': 'ISQUEMIA MESENTÉRICA.docx',
  'Linfadenite Mesentérica': 'Linfadenite mesentérica.docx',
  'Doença do Refluxo Gastroesofágico': 'DOENÇA DO REFLUXO GASTROESOFÁGICO - AGIR.docx',
  'Doença Inflamatória Pélvica': 'DOENÇA INFLAMATORIA PÉLVICA.docx',
  'Dor Abdominal': 'DOR ABDOMINAL.docx',
  'Antibioticoterapia na Colecistite Aguda e na Colangite Aguda': 'ANTIBIOTICOTERAPIA NA COLECISTITE AGUDA E NA COLANGITE AGUDA.docx',
  'Síndrome de Ogilvie': 'Síndrome de Ogilvie.docx',
};

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

    let html = result.value;
    html = `<div class="lesson-content prose prose-lg max-w-none">${html}</div>`;
    return html;
  } catch (error) {
    console.error(`Erro ao converter ${filePath}:`, error);
    return null;
  }
}

async function fixMissingLessons() {
  console.log('Buscando cursos sem aulas...\n');

  // Buscar todos os cursos
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, slug, description')
    .eq('is_published', true);

  if (coursesError) {
    console.error('Erro ao buscar cursos:', coursesError);
    return;
  }

  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const course of courses) {
    // Verificar se tem aulas
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', course.id);

    if (lessons && lessons.length > 0) {
      console.log(`[SKIP] ${course.title} - Ja tem ${lessons.length} aula(s)`);
      skipped++;
      continue;
    }

    console.log(`\n[FIX] ${course.title} - Sem aulas, criando...`);

    // Encontrar arquivo DOCX
    let docxFile = courseToFileMap[course.title];

    if (!docxFile) {
      // Tentar encontrar pelo slug
      const files = fs.readdirSync(DOCS_FOLDER);
      docxFile = files.find(f => {
        const name = f.replace('.docx', '').replace('.DOCX', '').toLowerCase();
        return name.includes(course.title.toLowerCase().split(' ')[0]);
      });
    }

    if (!docxFile) {
      console.log(`  ERRO: Arquivo DOCX nao encontrado para ${course.title}`);
      failed++;
      continue;
    }

    const filePath = path.join(DOCS_FOLDER, docxFile);

    if (!fs.existsSync(filePath)) {
      console.log(`  ERRO: Arquivo nao existe: ${filePath}`);
      failed++;
      continue;
    }

    console.log(`  Convertendo: ${docxFile}`);

    // Converter DOCX para HTML
    const contentHtml = await convertDocxToHtml(filePath);

    if (!contentHtml) {
      console.log(`  ERRO: Falha ao converter DOCX`);
      failed++;
      continue;
    }

    console.log(`  HTML gerado: ${contentHtml.length} caracteres`);

    // Criar a aula
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        course_id: course.id,
        title: course.title,
        slug: 'conteudo',
        description: course.description,
        order: 1,
        is_published: true,
        estimated_time: 30
      })
      .select()
      .single();

    if (lessonError) {
      console.log(`  ERRO ao criar aula: ${lessonError.message}`);
      failed++;
      continue;
    }

    console.log(`  Aula criada: ${lesson.id}`);

    // Inserir conteudo HTML
    const { error: contentError } = await supabase
      .from('lesson_content')
      .insert({
        lesson_id: lesson.id,
        content_html: contentHtml,
        original_file_url: docxFile
      });

    if (contentError) {
      console.log(`  ERRO ao inserir conteudo: ${contentError.message}`);
      failed++;
      continue;
    }

    console.log(`  Conteudo inserido com sucesso!`);
    fixed++;
  }

  console.log('\n========================================');
  console.log(`Resultado:`);
  console.log(`  Corrigidos: ${fixed}`);
  console.log(`  Pulados (ja tinham aula): ${skipped}`);
  console.log(`  Falharam: ${failed}`);
  console.log('========================================\n');
}

fixMissingLessons().catch(console.error);
