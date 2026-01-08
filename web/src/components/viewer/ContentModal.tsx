'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SecureContentViewer } from './SecureContentViewer'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface ContentModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  userEmail: string
  lessonId: string
  userId: string
  initialProgress?: number
  isCompleted?: boolean
  onProgressUpdate?: (progress: number, completed: boolean) => void
}

export function ContentModal({
  isOpen,
  onClose,
  title,
  content,
  userEmail,
  lessonId,
  userId,
  initialProgress = 0,
  isCompleted: initialIsCompleted = false,
  onProgressUpdate
}: ContentModalProps) {
  const mainRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(initialProgress)
  const [maxProgress, setMaxProgress] = useState(initialProgress)
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted)
  const [showCompletionButton, setShowCompletionButton] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Resetar estados quando modal abre
  useEffect(() => {
    if (isOpen) {
      setProgress(initialProgress)
      setMaxProgress(initialProgress)
      setIsCompleted(initialIsCompleted)
      setShowCompletionButton(initialIsCompleted || initialProgress >= 95)
    }
  }, [isOpen, initialProgress, initialIsCompleted])

  // Fechar com ESC
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Salvar progresso no Supabase (debounced)
  const saveProgress = useCallback(async (newProgress: number) => {
    if (!userId || !lessonId) return

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          progress_percent: Math.round(newProgress),
          last_position: Math.round(newProgress),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }, [userId, lessonId])

  // Marcar como concluído
  const handleComplete = async () => {
    if (!userId || !lessonId || isSaving) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          progress_percent: 100,
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })

      if (error) throw error

      setIsCompleted(true)
      setProgress(100)
      setMaxProgress(100)
      onProgressUpdate?.(100, true)
      toast.success('Aula concluida com sucesso!')
    } catch (error) {
      console.error('Error completing lesson:', error)
      toast.error('Erro ao marcar como concluida')
    } finally {
      setIsSaving(false)
    }
  }

  // Handler de scroll
  const handleScroll = useCallback(() => {
    if (!mainRef.current || isCompleted) return

    const element = mainRef.current
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight - element.clientHeight

    if (scrollHeight <= 0) return

    const currentProgress = (scrollTop / scrollHeight) * 100

    // Só atualiza se progresso atual for maior que o máximo registrado
    if (currentProgress > maxProgress) {
      setMaxProgress(currentProgress)
      setProgress(currentProgress)

      // Mostrar botão de conclusão quando chegar a 95%+
      if (currentProgress >= 95) {
        setShowCompletionButton(true)
      }

      // Debounce para salvar no banco
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress(currentProgress)
        onProgressUpdate?.(currentProgress, false)
      }, 1000)
    }
  }, [maxProgress, isCompleted, saveProgress, onProgressUpdate])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-background"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Header fixo com progresso */}
      <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-[60]">
        <div className="h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isCompleted && (
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            )}
            <h1
              id="modal-title"
              className="text-lg md:text-xl font-serif font-bold truncate"
            >
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {Math.round(maxProgress)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Barra de progresso */}
        <Progress
          value={maxProgress}
          className="h-1 rounded-none"
        />
      </header>

      {/* Conteudo com scroll */}
      <main
        ref={mainRef}
        className="pt-[68px] pb-20 h-full overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        <SecureContentViewer userEmail={userEmail} className="min-h-full">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
            <article
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-serif
                prose-h1:text-2xl prose-h1:md:text-3xl
                prose-h2:text-xl prose-h2:md:text-2xl
                prose-h3:text-lg prose-h3:md:text-xl
                prose-p:text-base prose-p:leading-relaxed
                prose-li:text-base
                prose-table:text-sm
                [&_table]:w-full [&_table]:border-collapse
                [&_th]:bg-muted [&_th]:p-3 [&_th]:text-left [&_th]:border [&_th]:border-border
                [&_td]:p-3 [&_td]:border [&_td]:border-border
                [&_img]:rounded-lg [&_img]:shadow-md"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Seção de conclusão */}
            {showCompletionButton && !isCompleted && (
              <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
                <h3 className="text-xl font-serif font-bold mb-2">
                  Voce chegou ao fim!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Clique no botao abaixo para marcar esta aula como concluida.
                </p>
                <Button
                  size="lg"
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {isSaving ? 'Salvando...' : 'Concluir Aula'}
                </Button>
              </div>
            )}

            {/* Mensagem de aula concluída */}
            {isCompleted && (
              <div className="mt-12 p-6 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-serif font-bold mb-2 text-primary">
                  Aula Concluida!
                </h3>
                <p className="text-muted-foreground">
                  Voce ja concluiu esta aula. Continue explorando outros conteudos.
                </p>
              </div>
            )}
          </div>
        </SecureContentViewer>
      </main>

      {/* Rodapé com progresso */}
      <footer className="fixed bottom-0 left-0 right-0 h-14 bg-card/95 backdrop-blur-sm border-t border-border flex items-center justify-between px-4 md:px-6 z-[60]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Progresso: {Math.round(maxProgress)}%</span>
          {isCompleted && (
            <span className="text-primary font-medium">• Concluida</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          ESC para fechar
        </span>
      </footer>
    </div>
  )
}
