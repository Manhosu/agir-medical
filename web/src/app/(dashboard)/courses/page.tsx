'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { BookOpen } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  slug: string
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Garantir que o componente está montado (evita problemas de hidratação)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadCourses()
    }
  }, [mounted])

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, cover_url, slug')
        .eq('is_published', true)
        .order('order', { ascending: true })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    (course.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif">Biblioteca de Cursos</h1>
        <p className="text-muted-foreground mt-1">
          Explore os guidelines disponiveis e continue seus estudos
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar cursos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Courses Grid */}
      {!mounted || isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full mt-2 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:border-primary transition-colors">
              {/* Cover Image */}
              <div className="aspect-video bg-muted flex items-center justify-center">
                {course.cover_url ? (
                  <img
                    src={course.cover_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              <CardHeader>
                <CardTitle className="font-serif">{course.title}</CardTitle>
                {course.description && (
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <Link href={`/courses/${course.id}`}>
                  <Button className="w-full">
                    Acessar Conteudo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum curso encontrado.</p>
        </div>
      )}
    </div>
  )
}
