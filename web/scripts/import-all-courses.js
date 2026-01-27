/**
 * Script para importar TODOS os cursos dos arquivos DOCX
 * Remove cursos existentes e importa os novos com design atualizado
 *
 * Uso: node scripts/import-all-courses.js
 */

const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Pasta com os arquivos DOCX (nova pasta docx na raiz)
const DOCS_FOLDER = path.join(__dirname, '../../docx');

// Categorias para organização
const CATEGORIES = {
  'abdome': 'Abdome Agudo',
  'hepato': 'Hepatobiliar',
  'intestinal': 'Intestinal',
  'hernia': 'Hérnias',
  'urologico': 'Urológico',
  'ginecologico': 'Ginecológico',
  'geral': 'Geral',
};

// Mapeamento de arquivos para categorias
const FILE_CATEGORIES = {
  'abdomem agudo obstrutivo': 'abdome',
  'abdomem agudo perfurativo': 'abdome',
  'abscesso hepatico': 'hepato',
  'antibioticoterapia': 'hepato',
  'apendicite': 'intestinal',
  'colangite': 'hepato',
  'colecistite': 'hepato',
  'diverticulite': 'intestinal',
  'refluxo': 'intestinal',
  'doenca inflamatoria pelvica': 'ginecologico',
  'dor abdominal': 'geral',
  'hernia inguina': 'hernia',
  'hernia umbilical': 'hernia',
  'isquemia mesenterica': 'intestinal',
  'linfadenite': 'intestinal',
  'pancreatite': 'hepato',
  'ogilvie': 'intestinal',
  'ureterolitiase': 'urologico',
  'volvo': 'intestinal',
};

// Função para criar slug
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Função para limpar título do arquivo
function getTitleFromFilename(filename) {
  let title = filename
    .replace('.docx', '')
    .replace('.DOCX', '')
    .replace(/ \(1\)/g, '')  // Remove "(1)" dos nomes
    .replace(/ 1$/g, '')     // Remove "1" do final
    .replace(' - AGIR', '')
    .trim();

  // Correções específicas
  const corrections = {
    'ABDOMEM AGUDO OBSTRUTIVO - BRIDAS': 'Abdome Agudo Obstrutivo - Bridas',
    'ABDOMEM AGUDO PERFURATIVO': 'Abdome Agudo Perfurativo',
    'ABSCESSO HEPÁTICO': 'Abscesso Hepático',
    'ANTIBIOTICOTERAPIA NA COLECISTITE AGUDA E NA COLANGITE AGUDA': 'Antibioticoterapia nas Colecistite e Colangite Agudas',
    'APENDICITE AGUDA': 'Apendicite Aguda',
    'COLANGITE AGUDA': 'Colangite Aguda',
    'COLECISTITE AGUDA': 'Colecistite Aguda',
    'DIVERTICULITE AGUDA': 'Diverticulite Aguda',
    'DOENÇA DO REFLUXO GASTROESOFÁGICO': 'Doença do Refluxo Gastroesofágico',
    'DOENÇA INFLAMATORIA PÉLVICA': 'Doença Inflamatória Pélvica',
    'Dor Abdominal': 'Dor Abdominal - Avaliação Sistemática',
    'HÉRNIA INGUINAIS': 'Hérnias Inguinais',
    'HÉRNIA UMBILICAL': 'Hérnia Umbilical',
    'ISQUEMIA MESENTÉRICA': 'Isquemia Mesentérica',
    'LINFADENITE MESENTÉRICA': 'Linfadenite Mesentérica',
    'PANCREATITE AGUDA': 'Pancreatite Aguda',
    'SÍNDROME DE OGILVIE': 'Síndrome de Ogilvie',
    'Ureterolitiase': 'Ureterolitíase',
    'VOLVO DE SIGMÓIDE': 'Volvo de Sigmóide',
  };

  return corrections[title] || title;
}

// Função para obter categoria
function getCategory(filename) {
  const lower = filename.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [key, category] of Object.entries(FILE_CATEGORIES)) {
    if (lower.includes(key)) {
      return CATEGORIES[category];
    }
  }
  return CATEGORIES['geral'];
}

// Função para obter descrição
function getDescription(title) {
  const descriptions = {
    'Abdome Agudo Obstrutivo - Bridas': 'Guideline completo sobre obstrução intestinal por bridas e aderências. Diagnóstico, classificação e manejo clínico-cirúrgico.',
    'Abdome Agudo Perfurativo': 'Abordagem diagnóstica e terapêutica do abdome agudo perfurativo. Causas, apresentação clínica e tratamento.',
    'Abscesso Hepático': 'Diagnóstico e tratamento de abscessos hepáticos piogênicos e amebianos. Indicações de drenagem.',
    'Antibioticoterapia nas Colecistite e Colangite Agudas': 'Protocolos atualizados de antibioticoterapia para infecções biliares agudas.',
    'Apendicite Aguda': 'Diagnóstico, classificação de Alvarado e manejo da apendicite aguda. Critérios cirúrgicos.',
    'Colangite Aguda': 'Critérios de Tokyo, classificação de gravidade e tratamento da colangite aguda.',
    'Colecistite Aguda': 'Diagnóstico e tratamento da colecistite aguda. Critérios de Tokyo e indicação cirúrgica.',
    'Diverticulite Aguda': 'Classificação de Hinchey, diagnóstico por imagem e manejo da diverticulite aguda.',
    'Doença do Refluxo Gastroesofágico': 'DRGE: fisiopatologia, diagnóstico, tratamento clínico e indicações cirúrgicas.',
    'Doença Inflamatória Pélvica': 'Diagnóstico e tratamento da DIP. Critérios diagnósticos e antibioticoterapia.',
    'Dor Abdominal - Avaliação Sistemática': 'Método A.G.I.R. para avaliação sistemática da dor abdominal no pronto-socorro.',
    'Hérnias Inguinais': 'Classificação de Nyhus, diagnóstico e técnicas de herniorrafia inguinal.',
    'Hérnia Umbilical': 'Indicações cirúrgicas e técnicas de reparo da hérnia umbilical.',
    'Isquemia Mesentérica': 'Diagnóstico e tratamento da isquemia mesentérica aguda e crônica. Urgência vascular.',
    'Linfadenite Mesentérica': 'Diagnóstico diferencial com apendicite. Manejo clínico e seguimento.',
    'Pancreatite Aguda': 'Critérios de Ranson e Atlanta, classificação de gravidade e tratamento da pancreatite.',
    'Síndrome de Ogilvie': 'Pseudo-obstrução colônica aguda: diagnóstico, tratamento clínico e descompressão.',
    'Ureterolitíase': 'Diagnóstico por imagem, classificação e manejo da cólica nefrética.',
    'Volvo de Sigmóide': 'Diagnóstico radiológico, descompressão endoscópica e tratamento cirúrgico.',
  };

  return descriptions[title] || `Guideline completo sobre ${title.toLowerCase()} no contexto do abdome agudo.`;
}

// Função para converter DOCX para HTML com melhor formatação
async function convertDocxToHtml(filePath) {
  try {
    const result = await mammoth.convertToHtml({ path: filePath }, {
      styleMap: [
        "p[style-name='Heading 1'] => h1.lesson-h1",
        "p[style-name='Heading 2'] => h2.lesson-h2",
        "p[style-name='Heading 3'] => h3.lesson-h3",
        "p[style-name='Title'] => h1.lesson-title",
        "b => strong",
        "i => em",
        "u => u",
        "table => table.lesson-table",
      ]
    });

    let html = result.value;

    // Melhorar formatação de parágrafos
    html = html.replace(/<p>/g, '<p class="lesson-paragraph">');

    // Detectar títulos em maiúsculas
    html = html.replace(
      /<p class="lesson-paragraph">([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s\-–:]{8,})<\/p>/g,
      (match, content) => {
        const trimmed = content.trim();
        if (trimmed === trimmed.toUpperCase() && trimmed.length >= 8) {
          return `<h2 class="lesson-h2">${trimmed}</h2>`;
        }
        return match;
      }
    );

    // Melhorar formatação de listas
    html = html.replace(/<ul>/g, '<ul class="lesson-list">');
    html = html.replace(/<ol>/g, '<ol class="lesson-list-ordered">');
    html = html.replace(/<li>/g, '<li class="lesson-list-item">');

    // Melhorar formatação de tabelas
    html = html.replace(/<table>/g, '<table class="lesson-table">');
    html = html.replace(/<tr>/g, '<tr class="lesson-table-row">');
    html = html.replace(/<td>/g, '<td class="lesson-table-cell">');
    html = html.replace(/<th>/g, '<th class="lesson-table-header">');

    // Wrap no container protegido
    html = `<article class="lesson-content" style="user-select: none; -webkit-user-select: none;">
${html}
</article>`;

    return html;
  } catch (error) {
    console.error(`Erro ao converter ${filePath}:`, error.message);
    return null;
  }
}

// Função para limpar cursos existentes
async function clearExistingCourses() {
  console.log('🗑️  Removendo cursos existentes...\n');

  try {
    // Buscar todos os cursos
    const { data: courses, error: fetchError } = await supabase
      .from('courses')
      .select('id, title');

    if (fetchError) throw fetchError;

    if (!courses || courses.length === 0) {
      console.log('  Nenhum curso existente encontrado.\n');
      return;
    }

    console.log(`  Encontrados ${courses.length} cursos para remover:`);
    courses.forEach(c => console.log(`    - ${c.title}`));

    // Deletar em cascata (lesson_content -> lessons -> courses)
    for (const course of courses) {
      // Buscar lessons do curso
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', course.id);

      if (lessons && lessons.length > 0) {
        // Deletar conteúdo das lessons
        for (const lesson of lessons) {
          await supabase
            .from('lesson_content')
            .delete()
            .eq('lesson_id', lesson.id);
        }

        // Deletar progresso dos usuários
        await supabase
          .from('user_progress')
          .delete()
          .in('lesson_id', lessons.map(l => l.id));

        // Deletar lessons
        await supabase
          .from('lessons')
          .delete()
          .eq('course_id', course.id);
      }

      // Deletar curso
      await supabase
        .from('courses')
        .delete()
        .eq('id', course.id);
    }

    console.log(`\n  ✓ ${courses.length} cursos removidos com sucesso!\n`);
  } catch (error) {
    console.error('  ❌ Erro ao limpar cursos:', error.message);
    throw error;
  }
}

// Função principal
async function importAllCourses() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     IMPORTAÇÃO DE CURSOS - PROGRAMA A.G.I.R.              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Verificar pasta
  if (!fs.existsSync(DOCS_FOLDER)) {
    console.error(`❌ Pasta não encontrada: ${DOCS_FOLDER}`);
    process.exit(1);
  }

  // Listar arquivos
  const files = fs.readdirSync(DOCS_FOLDER)
    .filter(f => f.toLowerCase().endsWith('.docx'))
    .sort();

  console.log(`📁 Pasta: ${DOCS_FOLDER}`);
  console.log(`📄 Arquivos encontrados: ${files.length}\n`);

  files.forEach((f, i) => {
    const title = getTitleFromFilename(f);
    const category = getCategory(f);
    console.log(`  ${String(i + 1).padStart(2, '0')}. ${title} [${category}]`);
  });

  console.log('\n' + '─'.repeat(60) + '\n');

  // Limpar cursos existentes
  await clearExistingCourses();

  console.log('📥 Iniciando importação dos novos cursos...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(DOCS_FOLDER, filename);
    const title = getTitleFromFilename(filename);
    const slug = createSlug(title);
    const description = getDescription(title);
    const category = getCategory(filename);

    console.log(`[${String(i + 1).padStart(2, '0')}/${files.length}] ${title}`);

    try {
      // 1. Converter DOCX para HTML
      const contentHtml = await convertDocxToHtml(filePath);
      if (!contentHtml) {
        throw new Error('Falha na conversão do arquivo');
      }
      console.log(`  ├─ ✓ Convertido para HTML`);

      // 2. Criar o curso
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title,
          slug,
          description,
          category,
          is_published: true,
          order: i + 1
        })
        .select()
        .single();

      if (courseError) throw courseError;
      console.log(`  ├─ ✓ Curso criado (ID: ${course.id.substring(0, 8)}...)`);

      // 3. Criar a aula
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          course_id: course.id,
          title: title,
          slug: 'conteudo',
          description: `Conteúdo completo: ${title}`,
          order: 1,
          is_published: true,
          estimated_time: 30
        })
        .select()
        .single();

      if (lessonError) throw lessonError;
      console.log(`  ├─ ✓ Aula criada`);

      // 4. Inserir conteúdo HTML
      const { error: contentError } = await supabase
        .from('lesson_content')
        .insert({
          lesson_id: lesson.id,
          content_html: contentHtml,
          original_file_url: filename
        });

      if (contentError) throw contentError;
      console.log(`  └─ ✅ Conteúdo inserido com sucesso!\n`);

      successCount++;

    } catch (error) {
      console.log(`  └─ ❌ Erro: ${error.message}\n`);
      errorCount++;
    }
  }

  // Resumo final
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 RESUMO DA IMPORTAÇÃO\n');
  console.log(`  ✅ Sucesso:  ${successCount} cursos`);
  console.log(`  ❌ Erros:    ${errorCount} cursos`);
  console.log(`  📄 Total:    ${files.length} arquivos`);
  console.log('\n' + '═'.repeat(60) + '\n');

  if (successCount === files.length) {
    console.log('🎉 Todos os cursos foram importados com sucesso!\n');
  } else if (errorCount > 0) {
    console.log('⚠️  Alguns cursos não foram importados. Verifique os erros acima.\n');
  }
}

// Executar
importAllCourses()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
