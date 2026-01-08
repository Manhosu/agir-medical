import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Course, Lesson, LessonContent, UserProgress } from '../types/database'

interface CourseWithProgress extends Course {
  totalLessons: number
  completedLessons: number
  progressPercent: number
}

interface LessonWithProgress extends Lesson {
  progress?: UserProgress | null
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar todos os cursos publicados com progresso do usuário
  const fetchCourses = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Buscar cursos
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('order', { ascending: true })

      if (coursesError) throw coursesError

      // Para cada curso, buscar contagem de aulas e progresso
      const coursesWithProgress: CourseWithProgress[] = await Promise.all(
        (coursesData || []).map(async course => {
          // Contar aulas
          const { count: totalLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('is_published', true)

          // Contar aulas completadas pelo usuário
          const { data: completedData } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('is_completed', true)

          const completedLessonIds = completedData?.map(p => p.lesson_id) || []

          // Verificar quais aulas completadas são deste curso
          const { count: completedLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('is_published', true)
            .in('id', completedLessonIds.length > 0 ? completedLessonIds : ['none'])

          const total = totalLessons || 0
          const completed = completedLessons || 0
          const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0

          return {
            ...course,
            totalLessons: total,
            completedLessons: completed,
            progressPercent,
          }
        }),
      )

      setCourses(coursesWithProgress)
    } catch (err: any) {
      console.error('Error fetching courses:', err)
      setError(err.message || 'Erro ao carregar cursos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Buscar detalhes de um curso específico
  const fetchCourseDetails = useCallback(
    async (courseId: string, userId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // Buscar curso
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()

        if (courseError) throw courseError

        // Buscar aulas do curso
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .eq('is_published', true)
          .order('order', { ascending: true })

        if (lessonsError) throw lessonsError

        // Buscar progresso do usuário para cada aula
        const lessonsWithProgress: LessonWithProgress[] = await Promise.all(
          (lessons || []).map(async lesson => {
            const { data: progress } = await supabase
              .from('user_progress')
              .select('*')
              .eq('user_id', userId)
              .eq('lesson_id', lesson.id)
              .single()

            return {
              ...lesson,
              progress: progress as UserProgress | null,
            }
          }),
        )

        return {
          course: course as Course,
          lessons: lessonsWithProgress,
        }
      } catch (err: any) {
        console.error('Error fetching course details:', err)
        setError(err.message || 'Erro ao carregar detalhes do curso')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // Buscar conteúdo de uma aula
  const fetchLessonContent = useCallback(async (lessonId: string) => {
    try {
      const { data, error } = await supabase
        .from('lesson_content')
        .select('*')
        .eq('lesson_id', lessonId)
        .single()

      if (error) throw error
      return data as LessonContent
    } catch (err: any) {
      console.error('Error fetching lesson content:', err)
      return null
    }
  }, [])

  // Salvar progresso de uma aula (apenas se for maior que o atual)
  const saveProgress = useCallback(
    async (userId: string, lessonId: string, progressPercent: number) => {
      try {
        // Buscar progresso atual do banco para evitar regressao
        const { data: currentProgress } = await supabase
          .from('user_progress')
          .select('progress_percent')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .single()

        // Apenas salvar se o novo progresso for MAIOR que o atual
        if (currentProgress && progressPercent <= currentProgress.progress_percent) {
          console.log('Progress not saved: new value is not greater than current')
          return true // Retorna true pois nao e um erro
        }

        const { error } = await supabase.from('user_progress').upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            progress_percent: progressPercent,
            is_completed: progressPercent >= 90,
            completed_at: progressPercent >= 90 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,lesson_id',
          },
        )

        if (error) throw error
        return true
      } catch (err: any) {
        console.error('Error saving progress:', err)
        return false
      }
    },
    [],
  )

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
    fetchCourseDetails,
    fetchLessonContent,
    saveProgress,
  }
}

export default useCourses
