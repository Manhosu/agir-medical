'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  GraduationCap,
  Heart,
  Lightbulb,
  MessageSquareQuote,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'

interface DashboardStats {
  total_courses: number
  total_lessons: number
  completed_lessons: number
  in_progress_lessons: number
  average_progress: number
}

interface RecentCourse {
  id: string
  title: string
  progress: number
  lastAccessed: string
}

interface CoursePreview {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  thumbnail_url: string | null
  lesson_count: number
}

export default function DashboardPage() {
  const { user, profile, hasActiveSubscription } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([])
  const [availableCourses, setAvailableCourses] = useState<CoursePreview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      if (hasActiveSubscription) {
        loadDashboardData()
      } else {
        loadMarketingData()
      }
    }
  }, [user, hasActiveSubscription])

  const loadMarketingData = async () => {
    try {
      // Buscar cursos disponiveis para preview
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, description, cover_url, thumbnail_url')
        .eq('is_published', true)
        .limit(6)

      if (coursesData) {
        // Buscar contagem de aulas para cada curso
        const coursesWithLessons = await Promise.all(
          coursesData.map(async (course) => {
            const { count } = await supabase
              .from('lessons')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id)
              .eq('is_published', true)

            return {
              ...course,
              lesson_count: count || 0
            }
          })
        )
        setAvailableCourses(coursesWithLessons)
      }
    } catch (error) {
      console.error('Error loading marketing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // Buscar estatisticas usando a funcao do banco
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_dashboard_stats', { p_user_id: user.id })

      if (statsError) throw statsError
      setStats(statsData)

      // Buscar cursos recentes com progresso
      const { data: progressData } = await supabase
        .from('user_progress')
        .select(`
          progress_percent,
          updated_at,
          lesson:lessons (
            id,
            title,
            course:courses (
              id,
              title
            )
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10)

      // Agrupar por curso e calcular progresso medio
      const courseProgressMap = new Map<string, { id: string; title: string; progress: number; count: number; lastAccessed: string }>()

      progressData?.forEach((item: any) => {
        if (item.lesson?.course) {
          const courseId = item.lesson.course.id
          const existing = courseProgressMap.get(courseId)

          if (existing) {
            existing.progress += item.progress_percent
            existing.count += 1
            if (new Date(item.updated_at) > new Date(existing.lastAccessed)) {
              existing.lastAccessed = item.updated_at
            }
          } else {
            courseProgressMap.set(courseId, {
              id: courseId,
              title: item.lesson.course.title,
              progress: item.progress_percent,
              count: 1,
              lastAccessed: item.updated_at
            })
          }
        }
      })

      // Converter para array e calcular media
      const courses = Array.from(courseProgressMap.values())
        .map(c => ({
          id: c.id,
          title: c.title,
          progress: Math.round(c.progress / c.count),
          lastAccessed: formatRelativeTime(c.lastAccessed)
        }))
        .slice(0, 3)

      setRecentCourses(courses)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atras`
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atras`
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atras`
    return date.toLocaleDateString('pt-BR')
  }

  // Dashboard para usuarios SEM assinatura (Marketing)
  if (!hasActiveSubscription) {
    return (
      <div className="space-y-12">
        {/* Hero Section - Impactante */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 p-8 md:p-12 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Plataforma Exclusiva
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white">
                +{availableCourses.length} Guidelines
              </Badge>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold font-serif mb-4 leading-tight">
              Ola, {profile?.full_name?.split(' ')[0] || 'Estudante'}!<br />
              <span className="text-white/90">Sua aprovacao comeca aqui.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-8 leading-relaxed">
              A AGIR e a plataforma que reune os <strong className="text-white">guidelines mais cobrados</strong> em
              provas de residencia medica, organizados de forma didatica para maximizar seu aprendizado.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/subscription">
                <Button size="lg" className="gap-2 bg-white text-primary font-semibold shadow-lg hover:bg-white/90 hover:shadow-xl transition-all">
                  <Rocket className="w-5 h-5" />
                  Comecar Agora
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" className="gap-2 bg-white/20 text-white border-2 border-white/50 hover:bg-white/30 hover:border-white/70">
                  Explorar Conteudos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* O que e a AGIR */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Badge className="mb-4" variant="outline">
              <Heart className="w-3 h-3 mr-1 text-rose-500 dark:text-rose-400" />
              Feito por quem entende
            </Badge>
            <h2 className="text-3xl font-serif font-bold mb-4">
              O que e a AGIR?
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              A AGIR nasceu da necessidade real de estudantes de medicina: ter acesso aos
              <strong className="text-foreground"> guidelines e protocolos atualizados</strong>, organizados de forma
              clara e objetiva para provas de residencia.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Nosso conteudo e desenvolvido por medicos especializados que conhecem as bancas e
              sabem exatamente o que e cobrado. Chega de perder tempo procurando material espalhado -
              aqui voce encontra tudo em um so lugar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Atualizado 2025
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Baseado em evidencias
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Foco em provas
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center p-6 bg-primary/5 dark:bg-primary/10 border-primary/20">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-bold font-serif text-primary">{availableCourses.length}+</p>
              <p className="text-sm text-muted-foreground">Guidelines Completos</p>
            </Card>
            <Card className="text-center p-6 bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 text-emerald-600 dark:text-emerald-400" />
              <p className="text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400">95%</p>
              <p className="text-sm text-muted-foreground">Taxa de Aprovacao</p>
            </Card>
            <Card className="text-center p-6 bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/20">
              <Users className="w-10 h-10 mx-auto mb-3 text-violet-600 dark:text-violet-400" />
              <p className="text-3xl font-bold font-serif text-violet-600 dark:text-violet-400">500+</p>
              <p className="text-sm text-muted-foreground">Alunos Aprovados</p>
            </Card>
            <Card className="text-center p-6 bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20">
              <Award className="w-10 h-10 mx-auto mb-3 text-amber-600 dark:text-amber-400" />
              <p className="text-3xl font-bold font-serif text-amber-600 dark:text-amber-400">4.9</p>
              <p className="text-sm text-muted-foreground">Avaliacao Media</p>
            </Card>
          </div>
        </div>

        {/* Por que a AGIR e diferente */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-8">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Metodologia Unica</span>
            </div>
            <CardTitle className="text-2xl font-serif">
              Por que a AGIR e diferente?
            </CardTitle>
            <CardDescription className="text-base">
              Nosso conteudo nao e apenas uma copia de livros - e uma curadoria inteligente do que realmente importa.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Foco no que Cai</h3>
                <p className="text-muted-foreground">
                  Analisamos provas anteriores e identificamos os temas mais cobrados.
                  Voce estuda o que realmente importa.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Linguagem Clara</h3>
                <p className="text-muted-foreground">
                  Guidelines traduzidos para uma linguagem acessivel, sem perder a precisao tecnica
                  necessaria para a prova.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Sempre Atualizado</h3>
                <p className="text-muted-foreground">
                  Quando um guideline e atualizado, nosso conteudo tambem e.
                  Voce sempre estuda a versao mais recente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Depoimentos */}
        <div>
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              <MessageSquareQuote className="w-3 h-3 mr-1" />
              Depoimentos
            </Badge>
            <h2 className="text-2xl font-serif font-bold">O que nossos alunos dizem</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-card">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "A AGIR foi essencial na minha aprovacao. O conteudo e direto ao ponto e
                muito bem organizado. Recomendo demais!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold text-primary">MC</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Dra. Marina C.</p>
                  <p className="text-xs text-muted-foreground">Aprovada em Clinica Medica - USP</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "Estudava por varias fontes e perdia muito tempo. Com a AGIR, consegui
                otimizar meus estudos e focar no que realmente cai."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold text-primary">RF</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Dr. Rafael F.</p>
                  <p className="text-xs text-muted-foreground">Aprovado em Cirurgia Geral - UNICAMP</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "Material de altissima qualidade. Os guidelines estao sempre atualizados
                e a plataforma e muito facil de usar."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold text-primary">AS</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Dra. Ana S.</p>
                  <p className="text-xs text-muted-foreground">Aprovada em Pediatria - FMUSP</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Cursos em Destaque */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge variant="outline" className="mb-2">
                <FileText className="w-3 h-3 mr-1" />
                Biblioteca
              </Badge>
              <h2 className="text-2xl font-serif font-bold">Guidelines Disponiveis</h2>
              <p className="text-muted-foreground">Conteudo completo pronto para estudo</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="gap-2">
                Ver Todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-40 rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableCourses.slice(0, 6).map((course) => (
                <Card key={course.id} className="overflow-hidden group hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 bg-card">
                  <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center">
                    {(course.thumbnail_url || course.cover_url) ? (
                      <img
                        src={course.thumbnail_url || course.cover_url || ''}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-primary/50" />
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-serif line-clamp-2">{course.title}</CardTitle>
                    {course.description && (
                      <CardDescription className="line-clamp-2 text-sm">
                        {course.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link href="/subscription">
                      <Button className="w-full gap-2" size="sm">
                        <Zap className="w-4 h-4" />
                        Desbloquear Acesso
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* O que esta incluso */}
        <Card className="border-2 border-primary/20 bg-card">
          <CardHeader className="text-center pb-2">
            <Badge className="w-fit mx-auto mb-2" variant="outline">
              <Shield className="w-3 h-3 mr-1" />
              Garantia de Qualidade
            </Badge>
            <CardTitle className="text-2xl font-serif">O que esta incluso na assinatura?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                'Acesso a todos os guidelines da plataforma',
                'Atualizacoes automaticas de conteudo',
                'Novos cursos adicionados regularmente',
                'Acesso pelo computador e celular',
                'Suporte por email',
                'Certificados de conclusao',
                'Marcacao de progresso',
                'Cancelamento a qualquer momento'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 dark:bg-primary/10">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 p-8 md:p-12 text-center text-white">
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8" />
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Pronto para comecar sua jornada?
            </h2>

            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Junte-se a centenas de medicos que ja conquistaram sua vaga na residencia
              com a ajuda da AGIR. Sua aprovacao esta mais perto do que voce imagina.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Link href="/subscription">
                <Button size="lg" variant="secondary" className="gap-2 text-primary font-semibold shadow-lg">
                  <Crown className="w-5 h-5" />
                  Assinar Agora
                </Button>
              </Link>
            </div>

            <p className="text-sm text-white/60">
              A partir de <span className="text-white font-semibold">R$ 41,42/mes</span> no plano anual
            </p>
            <p className="text-xs text-white/40 mt-2">
              Cancele quando quiser - sem multas ou burocracia
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>
      </div>
    )
  }

  // Dashboard para usuarios COM assinatura (Original)
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif">
          Ola, {profile?.full_name?.split(' ')[0] || 'Estudante'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Continue de onde parou e acompanhe seu progresso.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cursos Disponiveis</CardDescription>
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <CardTitle className="text-3xl font-serif">{stats?.total_courses || 0}</CardTitle>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aulas Concluidas</CardDescription>
            {isLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <CardTitle className="text-3xl font-serif">
                {stats?.completed_lessons || 0}/{stats?.total_lessons || 0}
              </CardTitle>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Progresso Geral</CardDescription>
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <CardTitle className="text-3xl font-serif">{Math.round(stats?.average_progress || 0)}%</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-2 w-full" />
            ) : (
              <Progress value={stats?.average_progress || 0} className="h-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status da Assinatura</CardDescription>
            <CardTitle className="text-lg">
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ativa
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif">Continue Estudando</CardTitle>
              <CardDescription>Seus cursos mais recentes</CardDescription>
            </div>
            <Link href="/courses">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentCourses.length > 0 ? (
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.lastAccessed}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm">
                        {course.progress === 0 ? 'Iniciar' : 'Continuar'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Voce ainda nao iniciou nenhum curso</p>
              <Link href="/courses">
                <Button>Explorar Cursos</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/courses">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Biblioteca
              </CardTitle>
              <CardDescription>
                Acesse todos os guidelines e cursos disponiveis
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/profile">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Users className="w-5 h-5" />
                Meu Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informacoes pessoais
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/subscription">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Assinatura
              </CardTitle>
              <CardDescription>
                Gerencie sua assinatura e pagamentos
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}
