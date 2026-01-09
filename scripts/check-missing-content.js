/**
 * Script para verificar quais arquivos DOCX ainda não foram enviados para o Supabase
 *
 * Uso: node scripts/check-missing-content.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração do Supabase (usando as mesmas variáveis do .env.local)
require('dotenv').config({ path: path.join(__dirname, '../web/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE não encontradas')
  console.log('Certifique-se de que web/.env.local existe com:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=...')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Pasta com os arquivos DOCX
const PDFS_FOLDER = path.join(__dirname, '../pdfs')

// Arquivos que são documentos internos (não são conteúdo de curso)
const INTERNAL_DOCS = [
  'PROGRAMA AGIR - SITE.docx',
  'Projeto Aplicativo e Site.docx'
]

async function main() {
  console.log('\n📋 Verificando conteúdos não enviados para o Supabase...\n')

  // 1. Listar arquivos DOCX na pasta
  let docxFiles = []
  try {
    const files = fs.readdirSync(PDFS_FOLDER)
    docxFiles = files
      .filter(f => f.endsWith('.docx'))
      .filter(f => !INTERNAL_DOCS.includes(f))
      .map(f => ({
        filename: f,
        title: f.replace('.docx', '').replace(/\d+$/, '').trim()
      }))

    console.log(`📁 Encontrados ${docxFiles.length} arquivos DOCX (excluindo docs internos)\n`)
  } catch (error) {
    console.error('❌ Erro ao ler pasta pdfs:', error.message)
    process.exit(1)
  }

  // 2. Buscar cursos do Supabase
  console.log('🔍 Buscando cursos no Supabase...')
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title')
    .order('title')

  if (coursesError) {
    console.error('❌ Erro ao buscar cursos:', coursesError.message)
    process.exit(1)
  }

  console.log(`✅ Encontrados ${courses.length} cursos no banco\n`)

  // 3. Buscar aulas do Supabase
  console.log('🔍 Buscando aulas no Supabase...')
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title, course_id')
    .order('title')

  if (lessonsError) {
    console.error('❌ Erro ao buscar aulas:', lessonsError.message)
    process.exit(1)
  }

  console.log(`✅ Encontradas ${lessons.length} aulas no banco\n`)

  // 4. Normalizar títulos para comparação
  const normalize = (str) => str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
    .trim()

  // Criar set de títulos existentes (cursos + aulas)
  const existingTitles = new Set([
    ...courses.map(c => normalize(c.title)),
    ...lessons.map(l => normalize(l.title))
  ])

  // 5. Comparar e encontrar faltantes
  const missing = []
  const found = []

  for (const file of docxFiles) {
    const normalizedTitle = normalize(file.title)

    // Verificar se existe algum match parcial
    let isFound = false
    for (const existing of existingTitles) {
      if (existing.includes(normalizedTitle) || normalizedTitle.includes(existing)) {
        isFound = true
        break
      }
    }

    if (isFound) {
      found.push(file)
    } else {
      missing.push(file)
    }
  }

  // 6. Exibir resultados
  console.log('═'.repeat(60))
  console.log('\n✅ ARQUIVOS JÁ NO SISTEMA:')
  console.log('─'.repeat(60))
  if (found.length === 0) {
    console.log('   Nenhum')
  } else {
    found.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.title}`)
    })
  }

  console.log('\n❌ ARQUIVOS FALTANDO (precisam ser enviados):')
  console.log('─'.repeat(60))
  if (missing.length === 0) {
    console.log('   Nenhum! Todos os arquivos já estão no sistema.')
  } else {
    missing.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.filename}`)
    })
  }

  console.log('\n' + '═'.repeat(60))
  console.log(`\n📊 RESUMO:`)
  console.log(`   Total de arquivos DOCX: ${docxFiles.length}`)
  console.log(`   Já no sistema: ${found.length}`)
  console.log(`   Faltando: ${missing.length}`)
  console.log(`   Cursos no banco: ${courses.length}`)
  console.log(`   Aulas no banco: ${lessons.length}`)

  if (missing.length > 0) {
    console.log(`\n💡 Para enviar os arquivos faltantes:`)
    console.log(`   1. Acesse http://localhost:3000/admin/courses`)
    console.log(`   2. Crie um novo curso ou selecione um existente`)
    console.log(`   3. Adicione uma aula e faça upload do conteúdo`)
  }

  console.log('\n')
}

main().catch(console.error)
