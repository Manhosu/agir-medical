'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  CreditCard,
  GraduationCap,
  Clock,
  CheckCircle2
} from 'lucide-react'

interface ReportStats {
  totalUsers: number
  activeSubscriptions: number
  expiredSubscriptions: number
  totalCourses: number
  publishedCourses: number
  totalLessons: number
  newUsersThisMonth: number
  newUsersLastMonth: number
  completedLessons: number
  inProgressLessons: number
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Buscar todas as estatisticas em paralelo
      const [
        usersResult,
        activeSubsResult,
        expiredSubsResult,
        coursesResult,
        publishedCoursesResult,
        lessonsResult,
        newUsersThisMonthResult,
        newUsersLastMonthResult,
        completedProgressResult,
        inProgressResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true })
          .eq('status', 'active').gt('expires_at', now.toISOString()),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true })
          .in('status', ['expired', 'canceled']),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', thisMonthStart.toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonthStart.toISOString())
          .lt('created_at', lastMonthEnd.toISOString()),
        supabase.from('user_progress').select('*', { count: 'exact', head: true })
          .eq('is_completed', true),
        supabase.from('user_progress').select('*', { count: 'exact', head: true })
          .eq('is_completed', false).gt('progress_percent', 0),
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        activeSubscriptions: activeSubsResult.count || 0,
        expiredSubscriptions: expiredSubsResult.count || 0,
        totalCourses: coursesResult.count || 0,
        publishedCourses: publishedCoursesResult.count || 0,
        totalLessons: lessonsResult.count || 0,
        newUsersThisMonth: newUsersThisMonthResult.count || 0,
        newUsersLastMonth: newUsersLastMonthResult.count || 0,
        completedLessons: completedProgressResult.count || 0,
        inProgressLessons: inProgressResult.count || 0,
      })
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const growthRate = stats && stats.newUsersLastMonth > 0
    ? Math.round(((stats.newUsersThisMonth - stats.newUsersLastMonth) / stats.newUsersLastMonth) * 100)
    : stats?.newUsersThisMonth ? 100 : 0

  const conversionRate = stats && stats.totalUsers > 0
    ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100)
    : 0

  const publishRate = stats && stats.totalCourses > 0
    ? Math.round((stats.publishedCourses / stats.totalCourses) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-serif">Relatorios</h1>
          <p className="text-muted-foreground mt-1">Metricas e estatisticas do sistema</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif">Relatorios</h1>
        <p className="text-muted-foreground mt-1">Metricas e estatisticas do sistema em tempo real</p>
      </div>

      {/* Usuarios */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Usuarios</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios registrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Este Mes</CardTitle>
              {growthRate >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.newUsersThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">
                {growthRate >= 0 ? '+' : ''}{growthRate}% em relacao ao mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mes Anterior</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.newUsersLastMonth || 0}</div>
              <p className="text-xs text-muted-foreground">
                Novos usuarios no mes passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversao</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Usuarios com assinatura ativa
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assinaturas */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Assinaturas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.activeSubscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios com acesso completo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas Expiradas</CardTitle>
              <CreditCard className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.expiredSubscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Canceladas ou expiradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Potencial</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.expiredSubscriptions || 0} usuarios
              </div>
              <p className="text-xs text-muted-foreground">
                Podem ser recuperados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conteudo */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Conteudo</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cursos criados no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Publicados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.publishedCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {publishRate}% do total publicado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLessons || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aulas disponiveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media por Curso</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats && stats.totalCourses > 0
                  ? Math.round(stats.totalLessons / stats.totalCourses)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Aulas por curso
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progresso dos Usuarios */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Progresso dos Usuarios</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aulas Concluidas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.completedLessons || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total de aulas finalizadas por todos os usuarios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.inProgressLessons || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aulas iniciadas mas nao concluidas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
