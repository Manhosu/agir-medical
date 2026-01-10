'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  description: string | null
  category: string | null
  thumbnail_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail_url: '',
    is_published: false
  })

  useEffect(() => {
    loadCourse()
  }, [courseId])

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (error) throw error

      setCourse(data)
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        thumbnail_url: data.thumbnail_url || '',
        is_published: data.is_published || false
      })
    } catch (error) {
      console.error('Error loading course:', error)
      toast.error('Erro ao carregar curso')
      router.push('/admin/courses')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('O titulo e obrigatorio')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category.trim() || null,
          thumbnail_url: formData.thumbnail_url.trim() || null,
          is_published: formData.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)

      if (error) throw error

      toast.success('Curso atualizado com sucesso!')
      router.push('/admin/courses')
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error('Erro ao atualizar curso')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Curso nao encontrado</p>
        <Link href="/admin/courses">
          <Button variant="link">Voltar para lista de cursos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-serif font-bold">Editar Curso</h1>
          <p className="text-muted-foreground">
            Atualize as informacoes do curso
          </p>
        </div>
        <Link href={`/admin/courses/${courseId}/lessons`}>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Gerenciar Aulas
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informacoes do Curso</CardTitle>
            <CardDescription>
              Atualize os dados basicos do curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex: Apendicite Aguda"
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descreva o conteudo do curso..."
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="Ex: Emergencia, Cirurgia"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">URL da Imagem</Label>
                <Input
                  id="thumbnail_url"
                  name="thumbnail_url"
                  placeholder="https://..."
                  value={formData.thumbnail_url}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Publicado</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.is_published
                    ? 'O curso esta visivel para os usuarios'
                    : 'O curso esta em modo rascunho'}
                </p>
              </div>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                disabled={isSubmitting}
              />
            </div>

            {/* Informacoes do sistema */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>ID:</strong> {course.id}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Criado em:</strong> {new Date(course.created_at).toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Atualizado em:</strong> {new Date(course.updated_at).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/admin/courses">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alteracoes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
