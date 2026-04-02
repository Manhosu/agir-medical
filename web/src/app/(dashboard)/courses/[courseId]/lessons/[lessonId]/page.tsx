'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Menu,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface Lesson {
  id: string
  title: string
  description: string | null
  order: number
  estimated_time: number | null
}

interface LessonContent {
  content_html: string
}

export default function LessonViewerPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, hasActiveSubscription } = useAuth()

  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [content, setContent] = useState<string>('')
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [maxProgress, setMaxProgress] = useState(0) // Track maximum progress reached
  const [showSidebar, setShowSidebar] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null)

  // Verificar assinatura
  useEffect(() => {
    if (!hasActiveSubscription && !isLoading) {
      toast.error('Você precisa de uma assinatura ativa para acessar o conteúdo')
      router.push(`/courses/${courseId}`)
    }
  }, [hasActiveSubscription, isLoading, courseId, router])

  // Carregar dados da aula
  useEffect(() => {
    if (lessonId && hasActiveSubscription) {
      loadLessonData()
    }
  }, [lessonId, hasActiveSubscription])

  // Bloquear atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Ctrl+P (print), Ctrl+S (save), Ctrl+C (copy), F12 (devtools)
      if (
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault()
        toast.error('Esta ação não é permitida')
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      toast.error('Clique direito desabilitado')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  // Rastrear progresso de scroll (apenas aumenta, nunca diminui)
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const element = contentRef.current
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight - element.clientHeight
      const scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      const currentProgress = Math.min(100, Math.round(scrollProgress))

      // Apenas atualizar se o progresso AUMENTOU
      if (currentProgress > maxProgress) {
        setMaxProgress(currentProgress)
        setProgress(currentProgress)
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll)
      return () => contentElement.removeEventListener('scroll', handleScroll)
    }
  }, [content, maxProgress])

  // Salvar progresso periodicamente (usa maxProgress para evitar regressao)
  useEffect(() => {
    if (maxProgress > 0 && user) {
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current)
      }

      progressUpdateRef.current = setTimeout(() => {
        saveProgress(maxProgress)
      }, 2000) // Salvar após 2 segundos de inatividade
    }

    return () => {
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current)
      }
    }
  }, [maxProgress, user])

  const loadLessonData = async () => {
    try {
      // Carregar dados da aula
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw lessonError
      setLesson(lessonData)

      // Carregar conteúdo da aula
      const { data: contentData, error: contentError } = await supabase
        .from('lesson_content')
        .select('content_html')
        .eq('lesson_id', lessonId)
        .single()

      if (contentError && contentError.code !== 'PGRST116') {
        throw contentError
      }

      setContent(contentData?.content_html || '<p>Conteúdo não disponível.</p>')

      // Carregar todas as aulas do curso para navegação
      const { data: allLessonsData } = await supabase
        .from('lessons')
        .select('id, title, order, estimated_time, description')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order', { ascending: true })

      setAllLessons(allLessonsData || [])

      // Carregar progresso existente
      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('progress_percent')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single()

        if (progressData) {
          setProgress(progressData.progress_percent)
          setMaxProgress(progressData.progress_percent) // Inicializar maxProgress com valor salvo
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error)
      toast.error('Erro ao carregar aula')
    } finally {
      setIsLoading(false)
    }
  }

  const saveProgress = async (progressValue: number) => {
    if (!user || !lessonId) return

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          progress_percent: progressValue,
          is_completed: progressValue >= 90,
          completed_at: progressValue >= 90 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  const getCurrentLessonIndex = () => {
    return allLessons.findIndex(l => l.id === lessonId)
  }

  const goToPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1]
      router.push(`/courses/${courseId}/lessons/${prevLesson.id}`)
    }
  }

  const goToNextLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1]
      router.push(`/courses/${courseId}/lessons/${nextLesson.id}`)
    }
  }

  const markAsCompleted = async () => {
    await saveProgress(100)
    setProgress(100)
    toast.success('Aula marcada como concluída!')
  }

  // Gerar watermark text
  const watermarkText = profile?.email || user?.email || 'Usuário'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-serif mb-4">Aula não encontrada</h2>
        <Link href={`/courses/${courseId}`}>
          <Button>Voltar para o Curso</Button>
        </Link>
      </div>
    )
  }

  const currentIndex = getCurrentLessonIndex()
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < allLessons.length - 1

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Lista de Aulas */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold truncate">Conteúdo do Curso</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setShowSidebar(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {allLessons.map((l, index) => (
            <Link
              key={l.id}
              href={`/courses/${courseId}/lessons/${l.id}`}
              className={`block p-4 border-b hover:bg-accent/50 transition-colors ${
                l.id === lessonId ? 'bg-accent border-l-4 border-l-primary' : ''
              }`}
              onClick={() => setShowSidebar(false)}
            >
              <div className="flex items-start gap-3">
                <span className="text-sm text-muted-foreground flex-shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="font-medium text-sm truncate">{l.title}</h3>
                  {l.estimated_time && (
                    <span className="text-xs text-muted-foreground">
                      {l.estimated_time} min
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Overlay para fechar sidebar em mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{lesson.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Aula {currentIndex + 1} de {allLessons.length}</span>
              {lesson.estimated_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.estimated_time} min
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {progress}% lido
            </span>
            <Progress value={progress} className="w-24 h-2" />
          </div>
        </div>

        {/* Área de Conteúdo Seguro */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 lg:p-12 content-protected relative"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          {/* Watermark */}
          <div
            className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
            style={{ opacity: 0.03 }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute whitespace-nowrap text-foreground font-mono text-sm"
                style={{
                  top: `${(i * 5) % 100}%`,
                  left: `${(i * 7) % 100}%`,
                  transform: 'rotate(-30deg)',
                }}
              >
                {watermarkText}
              </div>
            ))}
          </div>

          {/* Conteúdo HTML */}
          <div
            className="prose prose-lg dark:prose-invert dark-prose max-w-4xl mx-auto relative z-0"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Espaço extra para garantir scroll */}
          <div className="h-24" />
        </div>

        {/* Footer de Navegação */}
        <div className="flex items-center justify-between p-4 border-t bg-background">
          <Button
            variant="outline"
            onClick={goToPreviousLesson}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button
            variant="secondary"
            onClick={markAsCompleted}
            disabled={progress >= 100}
          >
            {progress >= 100 ? 'Concluída' : 'Marcar como concluída'}
          </Button>

          <Button
            variant="outline"
            onClick={goToNextLesson}
            disabled={!hasNext}
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
