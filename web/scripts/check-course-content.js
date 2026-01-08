// Script para verificar conteudo dos cursos
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCourseContent() {
  // Buscar cursos
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('is_published', true)
    .limit(5)

  if (coursesError) {
    console.error('Erro ao buscar cursos:', coursesError)
    return
  }

  console.log(`\nEncontrados ${courses.length} cursos:\n`)

  for (const course of courses) {
    console.log(`Curso: ${course.title}`)
    console.log(`  ID: ${course.id}`)

    // Buscar aulas do curso
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, is_published')
      .eq('course_id', course.id)

    if (lessonsError) {
      console.log(`  Erro ao buscar aulas: ${lessonsError.message}`)
      continue
    }

    console.log(`  Aulas: ${lessons.length}`)

    if (lessons.length > 0) {
      for (const lesson of lessons) {
        console.log(`    - ${lesson.title} (published: ${lesson.is_published})`)

        // Verificar conteudo
        const { data: content, error: contentError } = await supabase
          .from('lesson_content')
          .select('id, content_html')
          .eq('lesson_id', lesson.id)
          .single()

        if (contentError) {
          console.log(`      Conteudo: ERRO - ${contentError.message}`)
        } else if (content) {
          const htmlLength = content.content_html?.length || 0
          console.log(`      Conteudo: ${htmlLength} caracteres`)
        } else {
          console.log(`      Conteudo: NAO ENCONTRADO`)
        }
      }
    }

    console.log('')
  }
}

checkCourseContent().catch(console.error)
