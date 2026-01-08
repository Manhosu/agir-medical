'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function NewCoursePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail_url: '',
    is_published: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('O título é obrigatório')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category.trim() || null,
          thumbnail_url: formData.thumbnail_url.trim() || null,
          is_published: formData.is_published
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Curso criado com sucesso!')
      router.push(`/admin/courses/${data.id}/lessons`)
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error('Erro ao criar curso')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold">Novo Curso</h1>
          <p className="text-muted-foreground">
            Crie um novo curso ou guideline
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Curso</CardTitle>
            <CardDescription>
              Preencha os dados básicos do curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
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
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descreva o conteúdo do curso..."
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
                  placeholder="Ex: Emergência, Cirurgia"
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
                <Label>Publicar imediatamente</Label>
                <p className="text-sm text-muted-foreground">
                  Se desativado, o curso ficará como rascunho
                </p>
              </div>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/admin/courses">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Criando...' : 'Criar Curso'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
