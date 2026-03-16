'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { ContentModal } from '@/components/viewer'
import {
  ArrowLeft,
  BookOpen,
  Lock,
  Crown,
  Play,
  Shield,
  Eye,
  CheckCircle2,
  Zap,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  thumbnail_url: string | null
  is_published: boolean
  guideline_url: string | null
}

interface LessonWithContent {
  id: string
  title: string
  content_html: string
}

interface UserProgress {
  progress_percent: number
  is_completed: boolean
}

export default function CourseDetailPage() {
  const params = useParams()
  const { user, hasActiveSubscription, isLoading: authLoading } = useAuth()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [lessonContent, setLessonContent] = useState<LessonWithContent | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGuidelineOpen, setIsGuidelineOpen] = useState(false)

  useEffect(() => {
    if (courseId && user?.id) {
      loadCourseData()
    } else if (courseId && !authLoading && !user) {
      loadCourseData()
    }
  }, [courseId, user?.id, authLoading])

  const loadCourseData = async () => {
    try {
      // Carregar dados do curso
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Buscar a primeira aula do curso (cada curso tem apenas uma aula)
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order', { ascending: true })
        .limit(1)
        .single()

      if (lessonError && lessonError.code !== 'PGRST116') {
        console.error('Lesson error:', lessonError)
      }

      if (lessonData) {
        // Buscar conteudo da aula
        const { data: contentData, error: contentError } = await supabase
          .from('lesson_content')
          .select('content_html')
          .eq('lesson_id', lessonData.id)
          .single()

        if (contentError && contentError.code !== 'PGRST116') {
          console.error('Content error:', contentError)
        }

        if (contentData) {
          setLessonContent({
            id: lessonData.id,
            title: lessonData.title,
            content_html: contentData.content_html
          })
        }

        // Buscar progresso do usuario (se logado)
        if (user?.id) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('progress_percent, is_completed')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonData.id)
            .single()

          if (progressError && progressError.code !== 'PGRST116') {
            console.error('Progress error:', progressError)
          }

          if (progressData) {
            setUserProgress(progressData)
          }
        }
      }
    } catch (error) {
      console.error('Error loading course:', error)
      toast.error('Erro ao carregar curso')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenContent = () => {
    if (!hasActiveSubscription) {
      toast.error('Voce precisa de uma assinatura ativa para acessar o conteudo')
      return
    }
    if (!lessonContent) {
      toast.error('Conteudo nao disponivel')
      return
    }
    setIsModalOpen(true)
  }

  const handleOpenGuideline = () => {
    if (!hasActiveSubscription) {
      toast.error('Voce precisa de uma assinatura ativa para acessar o conteudo')
      return
    }
    if (!course?.guideline_url) {
      toast.error('Guideline nao disponivel')
      return
    }
    setIsGuidelineOpen(true)
  }

  const handleProgressUpdate = (progress: number, completed: boolean) => {
    setUserProgress({
      progress_percent: progress,
      is_completed: completed
    })
  }

  if (isLoading || authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-serif mb-4">Curso nao encontrado</h2>
        <Link href="/courses">
          <Button>Voltar para Cursos</Button>
        </Link>
      </div>
    )
  }

  // Se nao tem assinatura, mostrar preview bloqueado
  if (!hasActiveSubscription) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold">{course.title}</h1>
          </div>
        </div>

        {/* Blocked Content Card */}
        <Card className="overflow-hidden">
          <div className="relative">
            {/* Cover com titulo */}
            <div className="relative h-64">
              <img
                src={course.thumbnail_url || course.cover_url || '/course-cover.png'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-xl font-bold text-white drop-shadow-lg">{course.title}</h3>
              </div>
            </div>

            {/* Overlay bloqueio */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2 text-center">
                Conteudo Exclusivo para Assinantes
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Assine a AGIR para ter acesso a este e todos os outros guidelines da plataforma.
              </p>
              <Link href="/subscription">
                <Button size="lg" className="gap-2">
                  <Crown className="h-5 w-5" />
                  Assinar Agora
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Course Info */}
        {course.description && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Sobre este guideline</h3>
              <p className="text-muted-foreground">{course.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const progressPercent = userProgress?.progress_percent || 0
  const isCompleted = userProgress?.is_completed || false

  // Se tem assinatura, mostrar card com botao para abrir modal
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold">{course.title}</h1>
          </div>
        </div>

        {/* Course Card */}
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Cover com titulo */}
            <div className="relative h-64 md:h-auto md:min-h-[320px] overflow-hidden">
              <img
                src={course.thumbnail_url || course.cover_url || '/course-cover.png'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-xl md:text-2xl font-bold text-white drop-shadow-lg">{course.title}</h3>
                <p className="text-xs text-primary/80 mt-1 font-medium tracking-wider uppercase">Programa A.G.I.R.</p>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {isCompleted ? (
                    <Badge variant="default" className="gap-1 bg-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      Concluido
                    </Badge>
                  ) : progressPercent > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      Em Progresso - {Math.round(progressPercent)}%
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Conteudo Protegido
                  </Badge>
                </div>

                <div>
                  <h2 className="text-2xl font-serif font-bold mb-2">{course.title}</h2>
                  {course.description && (
                    <p className="text-muted-foreground">{course.description}</p>
                  )}
                </div>

                {/* Progress Bar */}
                {progressPercent > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seu progresso</span>
                      <span className="font-medium">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}

                {/* Features */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span>Visualizador seguro com protecao anti-copia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Watermark personalizada com seu email</span>
                  </div>
                </div>

                {/* Content Type Selection or Single Action */}
                {course.guideline_url ? (
                  <div className="space-y-3 mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Escolha o tipo de conteudo:</p>
                    <button
                      onClick={handleOpenGuideline}
                      className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">Conduta Rapida</p>
                        <p className="text-xs text-muted-foreground">Guideline / Protocolo do Plantao</p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-primary rotate-180 shrink-0" />
                    </button>
                    {lessonContent && (
                      <button
                        onClick={handleOpenContent}
                        className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">Fundamentacao Clinica</p>
                          <p className="text-xs text-muted-foreground">Conteudo Completo</p>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0" />
                      </button>
                    )}
                  </div>
                ) : lessonContent ? (
                  <Button
                    size="lg"
                    className="w-full md:w-auto gap-2 mt-4"
                    onClick={handleOpenContent}
                  >
                    {isCompleted ? (
                      <>
                        <Eye className="h-5 w-5" />
                        Revisar Conteudo
                      </>
                    ) : progressPercent > 0 ? (
                      <>
                        <Play className="h-5 w-5" />
                        Continuar Leitura
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        Iniciar Leitura
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Este guideline ainda nao possui conteudo disponivel.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Protecao de Conteudo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Este conteudo e protegido contra copia, impressao e captura de tela.
                Uma watermark com seu email sera exibida sobre o conteudo para
                sua seguranca e rastreabilidade.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Visualizador Otimizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                O conteudo sera exibido em tela cheia para melhor experiencia de
                leitura. Use a tecla ESC ou o botao X para fechar o visualizador.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Conteudo */}
      {lessonContent && user && (
        <ContentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={course.title}
          content={lessonContent.content_html}
          userEmail={user.email || 'usuario@agir.com'}
          lessonId={lessonContent.id}
          userId={user.id}
          initialProgress={progressPercent}
          isCompleted={isCompleted}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      {/* Guideline Modal (iframe) */}
      {isGuidelineOpen && course.guideline_url && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-sm">{course.title}</h3>
                <p className="text-xs text-muted-foreground">Conduta Rapida - Guideline</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsGuidelineOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <iframe
            src={`/api/gp/${new URL(course.guideline_url).host}`}
            className="w-full border-0"
            style={{ height: 'calc(100vh - 57px)' }}
            title={`Guideline - ${course.title}`}
            allow="fullscreen"
          />
        </div>
      )}
    </>
  )
}
