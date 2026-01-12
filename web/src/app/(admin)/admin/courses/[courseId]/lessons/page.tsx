'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { convertPdfToHtml, estimateReadingTime } from '@/lib/pdf-converter'
import { convertDocxToHtml, isValidDocx, isValidPdf, getFileType } from '@/lib/docx-converter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  ArrowLeft,
  Plus,
  GripVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  ToggleLeft,
  ToggleRight,
  Upload,
  Save,
  FileUp,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
}

interface Lesson {
  id: string
  title: string
  slug: string
  description: string | null
  order: number
  estimated_time: number | null
  is_published: boolean
  has_content?: boolean
}

export default function CourseLessonsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimated_time: '',
    is_published: true
  })
  const [htmlContent, setHtmlContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // PDF upload state
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (courseId) {
      loadData()
    }
  }, [courseId])

  const loadData = async () => {
    try {
      // Carregar curso
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Carregar aulas
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          *,
          lesson_content (id)
        `)
        .eq('course_id', courseId)
        .order('order', { ascending: true })

      if (lessonsError) throw lessonsError

      const lessonsWithContent = lessonsData.map((lesson: any) => ({
        ...lesson,
        has_content: !!lesson.lesson_content?.length
      }))

      setLessons(lessonsWithContent)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const openNewDialog = () => {
    setEditingLesson(null)
    setFormData({
      title: '',
      description: '',
      estimated_time: '',
      is_published: true
    })
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      estimated_time: lesson.estimated_time?.toString() || '',
      is_published: lesson.is_published
    })
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const openContentDialog = async (lesson: Lesson) => {
    setEditingLesson(lesson)
    setSelectedFile(null)

    // Carregar conteúdo existente
    const { data } = await supabase
      .from('lesson_content')
      .select('content_html')
      .eq('lesson_id', lesson.id)
      .single()

    setHtmlContent(data?.content_html || '')
    setIsContentDialogOpen(true)
  }

  // Gerar slug a partir do título
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Handler para upload de PDF ou DOCX
  const handleFileUpload = async (file: File) => {
    const fileType = getFileType(file)

    if (fileType === 'unknown') {
      toast.error('Por favor, selecione um arquivo PDF ou DOCX válido')
      return
    }

    setSelectedFile(file)
    setIsConverting(true)
    setConversionProgress(10)

    try {
      if (fileType === 'pdf') {
        toast.info('Convertendo PDF para HTML...')
        setConversionProgress(30)

        const result = await convertPdfToHtml(file)
        setConversionProgress(70)

        // Atualizar conteúdo HTML
        setHtmlContent(result.fullHtml)

        // Estimar tempo de leitura
        const fullText = result.pages.map(p => p.textContent).join(' ')
        const readingTime = estimateReadingTime(fullText)

        // Se está no dialog de nova aula, atualizar o tempo estimado
        if (!editingLesson) {
          setFormData(prev => ({
            ...prev,
            estimated_time: readingTime.toString()
          }))
        }

        setConversionProgress(100)
        toast.success(`PDF convertido! ${result.totalPages} páginas, ~${readingTime} min de leitura`)
      } else if (fileType === 'docx') {
        toast.info('Convertendo DOCX para HTML...')
        setConversionProgress(30)

        const result = await convertDocxToHtml(file)
        setConversionProgress(70)

        // Atualizar conteúdo HTML
        setHtmlContent(result.html)

        // Se está no dialog de nova aula, atualizar o tempo estimado
        if (!editingLesson) {
          setFormData(prev => ({
            ...prev,
            estimated_time: result.estimatedReadingTime.toString()
          }))
        }

        setConversionProgress(100)
        toast.success(`DOCX convertido! ${result.wordCount} palavras, ~${result.estimatedReadingTime} min de leitura`)

        // Mostrar avisos se houver
        if (result.messages.length > 0) {
          result.messages.forEach(msg => toast.warning(msg))
        }
      }
    } catch (error) {
      console.error('Error converting file:', error)
      toast.error('Erro ao converter arquivo. Tente novamente.')
    } finally {
      setIsConverting(false)
      setConversionProgress(0)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório')
      return
    }

    // Para novas aulas, o documento é obrigatório
    if (!editingLesson && !selectedFile && !htmlContent) {
      toast.error('O upload de documento é obrigatório')
      return
    }

    setIsSubmitting(true)

    try {
      let lessonId: string

      if (editingLesson) {
        // Atualizar aula existente
        const { error } = await supabase
          .from('lessons')
          .update({
            title: formData.title.trim(),
            slug: generateSlug(formData.title.trim()),
            description: formData.description.trim() || null,
            estimated_time: formData.estimated_time ? parseInt(formData.estimated_time) : null,
            is_published: formData.is_published
          })
          .eq('id', editingLesson.id)

        if (error) throw error
        lessonId = editingLesson.id
        toast.success('Aula atualizada com sucesso!')
      } else {
        // Criar nova aula
        const newOrder = lessons.length > 0
          ? Math.max(...lessons.map(l => l.order)) + 1
          : 0

        const { data: newLesson, error } = await supabase
          .from('lessons')
          .insert([{
            course_id: courseId,
            title: formData.title.trim(),
            slug: generateSlug(formData.title.trim()),
            description: formData.description.trim() || null,
            estimated_time: formData.estimated_time ? parseInt(formData.estimated_time) : null,
            order: newOrder,
            is_published: formData.is_published
          }])
          .select('id')
          .single()

        if (error) throw error
        lessonId = newLesson.id
        toast.success('Aula criada com sucesso!')
      }

      // Se tem conteúdo HTML (de upload de PDF), salvar também
      if (htmlContent && lessonId) {
        const { data: existing } = await supabase
          .from('lesson_content')
          .select('id')
          .eq('lesson_id', lessonId)
          .single()

        if (existing) {
          await supabase
            .from('lesson_content')
            .update({ content_html: htmlContent })
            .eq('lesson_id', lessonId)
        } else {
          await supabase
            .from('lesson_content')
            .insert([{
              lesson_id: lessonId,
              content_html: htmlContent
            }])
        }
      }

      // Upload do PDF original para storage (se houver)
      if (selectedFile && lessonId) {
        const filePath = `${courseId}/${lessonId}/${selectedFile.name}`
        await supabase.storage
          .from('pdfs')
          .upload(filePath, selectedFile, { upsert: true })

        // Atualizar referência do arquivo original
        await supabase
          .from('lesson_content')
          .update({ original_file_url: filePath })
          .eq('lesson_id', lessonId)
      }

      setIsDialogOpen(false)
      setHtmlContent('')
      setSelectedFile(null)
      loadData()
    } catch (error) {
      console.error('Error saving lesson:', error)
      toast.error('Erro ao salvar aula')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveContent = async () => {
    if (!editingLesson) return

    setIsSubmitting(true)

    try {
      const { data: existing } = await supabase
        .from('lesson_content')
        .select('id')
        .eq('lesson_id', editingLesson.id)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('lesson_content')
          .update({ content_html: htmlContent })
          .eq('lesson_id', editingLesson.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('lesson_content')
          .insert([{
            lesson_id: editingLesson.id,
            content_html: htmlContent
          }])

        if (error) throw error
      }

      // Upload do PDF original para storage (se houver)
      if (selectedFile) {
        const filePath = `${courseId}/${editingLesson.id}/${selectedFile.name}`
        await supabase.storage
          .from('pdfs')
          .upload(filePath, selectedFile, { upsert: true })

        // Atualizar referência do arquivo original
        await supabase
          .from('lesson_content')
          .update({ original_file_url: filePath })
          .eq('lesson_id', editingLesson.id)
      }

      toast.success('Conteúdo salvo com sucesso!')
      setIsContentDialogOpen(false)
      setSelectedFile(null)
      loadData()
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Erro ao salvar conteúdo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePublished = async (lesson: Lesson) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: !lesson.is_published })
        .eq('id', lesson.id)

      if (error) throw error

      setLessons(lessons.map(l =>
        l.id === lesson.id ? { ...l, is_published: !lesson.is_published } : l
      ))

      toast.success(lesson.is_published ? 'Aula ocultada' : 'Aula publicada')
    } catch (error) {
      console.error('Error updating lesson:', error)
      toast.error('Erro ao atualizar aula')
    }
  }

  const handleDelete = async () => {
    if (!lessonToDelete) return

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonToDelete.id)

      if (error) throw error

      setLessons(lessons.filter(l => l.id !== lessonToDelete.id))
      toast.success('Aula excluída com sucesso')
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('Erro ao excluir aula')
    } finally {
      setIsDeleteDialogOpen(false)
      setLessonToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Curso não encontrado</p>
        <Link href="/admin/courses">
          <Button variant="link">Voltar para cursos</Button>
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
          <h1 className="text-3xl font-serif font-bold">Aulas do Curso</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Aula
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Aulas</CardTitle>
          <CardDescription>
            {lessons.length} aula(s) neste curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lessons.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson, index) => (
                  <TableRow key={lesson.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lesson.estimated_time ? `${lesson.estimated_time} min` : '-'}
                    </TableCell>
                    <TableCell>
                      {lesson.has_content ? (
                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Sim
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Não</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublished(lesson)}
                      >
                        {lesson.is_published ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <ToggleRight className="h-4 w-4" />
                            Publicada
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <ToggleLeft className="h-4 w-4" />
                            Rascunho
                          </span>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openContentDialog(lesson)}
                          title="Editar conteúdo"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(lesson)}
                          title="Editar aula"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setLessonToDelete(lesson)
                            setIsDeleteDialogOpen(true)
                          }}
                          title="Excluir aula"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma aula criada ainda</p>
              <Button onClick={openNewDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira aula
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar/editar aula */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Editar Aula' : 'Nova Aula'}
            </DialogTitle>
            <DialogDescription>
              {editingLesson ? 'Atualize os dados da aula' : 'Preencha os dados da nova aula'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lessonTitle">Título *</Label>
              <Input
                id="lessonTitle"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Diagnóstico"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonDescription">Descrição</Label>
              <Textarea
                id="lessonDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o conteúdo da aula..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {/* Upload de PDF ou DOCX - OBRIGATÓRIO */}
            <div className="space-y-2">
              <Label>Upload de Documento *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  disabled={isSubmitting || isConverting}
                />
                {isConverting ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Convertendo documento...</p>
                    <Progress value={conversionProgress} className="h-2" />
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-green-600" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">
                      Convertido! Tempo de leitura: ~{formData.estimated_time || '?'} min
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Trocar arquivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileUp className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Arraste um PDF ou DOCX ou clique para selecionar
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Selecionar Documento
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                O conteúdo da aula será extraído do documento. O tempo de leitura é calculado automaticamente.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label>Publicar aula</Label>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para conteúdo HTML */}
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conteúdo da Aula</DialogTitle>
            <DialogDescription>
              {editingLesson?.title} - Cole o conteúdo HTML convertido do DOCX
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Upload de PDF ou DOCX */}
            <div className="space-y-2">
              <Label>Upload de Documento (PDF ou DOCX)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  id="contentFileInput"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  disabled={isSubmitting || isConverting}
                />
                {isConverting ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Convertendo documento...</p>
                    <Progress value={conversionProgress} className="h-2" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileUp className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Faça upload de um PDF ou DOCX para converter automaticamente
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('contentFileInput')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Documento
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou edite o HTML diretamente
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="htmlContent">Conteúdo HTML</Label>
              <Textarea
                id="htmlContent"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<h1>Título</h1><p>Conteúdo...</p>"
                disabled={isSubmitting}
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-2">Pré-visualização:</p>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContentDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSaveContent} disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Conteúdo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a aula "{lessonToDelete?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
