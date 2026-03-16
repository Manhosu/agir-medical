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
  thumbnail_url: string | null
  slug: string
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, cover_url, thumbnail_url, slug')
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
      {isLoading ? (
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
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="overflow-hidden hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10 group cursor-pointer h-full">
                {/* Cover com titulo overlay */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={course.thumbnail_url || course.cover_url || '/course-cover.png'}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  {/* Borda verde sutil no topo */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
                  {/* Titulo */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-lg font-bold text-white leading-tight drop-shadow-lg">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-gray-300 mt-1.5 line-clamp-2 drop-shadow">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
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
