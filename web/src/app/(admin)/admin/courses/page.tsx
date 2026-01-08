'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  FileText,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  description: string | null
  category: string | null
  thumbnail_url: string | null
  is_published: boolean
  created_at: string
  lessons_count?: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCourses(filtered)
    } else {
      setFilteredCourses(courses)
    }
  }, [searchQuery, courses])

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons (id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const coursesWithCount = data.map((course: any) => ({
        ...course,
        lessons_count: course.lessons?.length || 0
      }))

      setCourses(coursesWithCount)
      setFilteredCourses(coursesWithCount)
    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('Erro ao carregar cursos')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePublished = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !currentStatus })
        .eq('id', courseId)

      if (error) throw error

      setCourses(courses.map(c =>
        c.id === courseId ? { ...c, is_published: !currentStatus } : c
      ))

      toast.success(currentStatus ? 'Curso despublicado' : 'Curso publicado')
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error('Erro ao atualizar curso')
    }
  }

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course)
    setDeleteDialogOpen(true)
  }

  const deleteCourse = async () => {
    if (!courseToDelete) return

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseToDelete.id)

      if (error) throw error

      setCourses(courses.filter(c => c.id !== courseToDelete.id))
      toast.success('Curso excluído com sucesso')
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Erro ao excluir curso')
    } finally {
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Cursos</h1>
          <p className="text-muted-foreground">
            Gerencie os cursos e guidelines da plataforma
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Curso
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-sm text-muted-foreground">Total de cursos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {courses.filter(c => c.is_published).length}
            </div>
            <p className="text-sm text-muted-foreground">Cursos publicados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {courses.reduce((acc, c) => acc + (c.lessons_count || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total de aulas</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Lista de Cursos</CardTitle>
              <CardDescription>
                {filteredCourses.length} curso(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Aulas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{course.title}</p>
                          {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {course.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.category || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {course.lessons_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.is_published ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Publicado
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                          Rascunho
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(course.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/courses/${course.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/courses/${course.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/courses/${course.id}/lessons`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Gerenciar aulas
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => togglePublished(course.id, course.is_published)}
                          >
                            {course.is_published ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Despublicar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Publicar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(course)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum curso encontrado</p>
                      <Link href="/admin/courses/new">
                        <Button variant="link" className="mt-2">
                          Criar primeiro curso
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o curso "{courseToDelete?.title}"?
              Esta ação não pode ser desfeita e todas as aulas serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
