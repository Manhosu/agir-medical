import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useAuthStore } from '../../stores/authStore'
import { useCourses } from '../../hooks/useCourses'
import { supabase } from '../../lib/supabase'
import type { CoursesScreenProps } from '../../navigation/types'
import type { Lesson, LessonContent } from '../../types/database'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function LessonViewerScreen() {
  const route = useRoute<CoursesScreenProps<'LessonViewer'>['route']>()
  const navigation = useNavigation<CoursesScreenProps<'LessonViewer'>['navigation']>()
  const { courseId, lessonId } = route.params
  const { user, profile, hasActiveSubscription } = useAuthStore()
  const { fetchLessonContent, saveProgress } = useCourses()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [content, setContent] = useState<string>('')
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  const webViewRef = useRef<WebView>(null)
  const progressSaveTimeout = useRef<NodeJS.Timeout | null>(null)

  // Verificar assinatura
  useEffect(() => {
    if (!hasActiveSubscription && !isLoading) {
      Alert.alert(
        'Acesso Negado',
        'Voce precisa de uma assinatura ativa para acessar o conteudo.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      )
    }
  }, [hasActiveSubscription, isLoading])

  // Carregar dados da aula
  useEffect(() => {
    if (lessonId && hasActiveSubscription) {
      loadLessonData()
    }
  }, [lessonId, hasActiveSubscription])

  const loadLessonData = async () => {
    try {
      // Carregar dados da aula
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw lessonError
      setLesson(lessonData)
      navigation.setOptions({ title: lessonData.title })

      // Carregar conteúdo
      const contentData = await fetchLessonContent(lessonId)
      setContent(contentData?.content_html || '<p>Conteudo nao disponivel.</p>')

      // Carregar todas as aulas do curso para navegação
      const { data: allLessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order', { ascending: true })

      setAllLessons(allLessonsData || [])

      // Carregar progresso existente
      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('progress_percent')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single()

        if (progressData) {
          setProgress(progressData.progress_percent)
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error)
      Alert.alert('Erro', 'Erro ao carregar aula')
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar progresso com debounce
  const handleProgressUpdate = useCallback(
    (newProgress: number) => {
      setProgress(newProgress)

      if (progressSaveTimeout.current) {
        clearTimeout(progressSaveTimeout.current)
      }

      progressSaveTimeout.current = setTimeout(() => {
        if (user) {
          saveProgress(user.id, lessonId, newProgress)
        }
      }, 2000)
    },
    [user, lessonId, saveProgress],
  )

  // Navegação entre aulas
  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < allLessons.length - 1

  const goToPrevious = () => {
    if (hasPrevious) {
      navigation.replace('LessonViewer', {
        courseId,
        lessonId: allLessons[currentIndex - 1].id,
      })
    }
  }

  const goToNext = () => {
    if (hasNext) {
      navigation.replace('LessonViewer', {
        courseId,
        lessonId: allLessons[currentIndex + 1].id,
      })
    }
  }

  const markAsCompleted = async () => {
    if (user) {
      await saveProgress(user.id, lessonId, 100)
      setProgress(100)
      Alert.alert('Sucesso', 'Aula marcada como concluida!')
    }
  }

  // Email do usuário para watermark
  const watermarkEmail = profile?.email || user?.email || 'Usuario'

  // HTML para o WebView com proteções
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * {
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          user-select: none;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #0A0A0B;
          color: #FAFAFA;
          padding: 16px;
          margin: 0;
          line-height: 1.6;
          font-size: 16px;
        }
        h1, h2, h3 {
          color: #FAFAFA;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h3 { font-size: 18px; }
        p {
          margin-bottom: 16px;
          text-align: justify;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        a {
          color: #22C55E;
        }
        .watermark {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1000;
          opacity: 0.03;
          overflow: hidden;
        }
        .watermark-text {
          position: absolute;
          white-space: nowrap;
          font-size: 12px;
          color: #FAFAFA;
          transform: rotate(-30deg);
        }
      </style>
    </head>
    <body>
      <div class="watermark">
        ${Array.from({ length: 20 })
          .map(
            (_, i) =>
              `<div class="watermark-text" style="top: ${(i * 5) % 100}%; left: ${(i * 7) % 100}%;">${watermarkEmail}</div>`,
          )
          .join('')}
      </div>
      <div class="content">
        ${content}
      </div>
      <script>
        // Reportar scroll progress
        let ticking = false;
        document.addEventListener('scroll', function() {
          if (!ticking) {
            window.requestAnimationFrame(function() {
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
              const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scroll', progress: Math.min(100, progress) }));
              ticking = false;
            });
            ticking = true;
          }
        });

        // Bloquear menu de contexto
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
        });

        // Bloquear cópia
        document.addEventListener('copy', function(e) {
          e.preventDefault();
        });
      </script>
    </body>
    </html>
  `

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'scroll') {
        handleProgressUpdate(data.progress)
      }
    } catch (e) {
      // Ignorar mensagens não-JSON
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Carregando conteudo...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          Aula {currentIndex + 1} de {allLessons.length}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressPercent}>{progress}%</Text>
      </View>

      {/* Content */}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Desabilitar gestos de zoom
        scalesPageToFit={false}
        bounces={false}
      />

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
          onPress={goToPrevious}
          disabled={!hasPrevious}>
          <Text
            style={[
              styles.navButtonText,
              !hasPrevious && styles.navButtonTextDisabled,
            ]}>
            ← Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.completeButton,
            progress >= 100 && styles.completeButtonDone,
          ]}
          onPress={markAsCompleted}
          disabled={progress >= 100}>
          <Text style={styles.completeButtonText}>
            {progress >= 100 ? '✓ Concluida' : 'Concluir'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
          onPress={goToNext}
          disabled={!hasNext}>
          <Text
            style={[
              styles.navButtonText,
              !hasNext && styles.navButtonTextDisabled,
            ]}>
            Proxima →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0B',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#A1A1AA',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#18181B',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  progressText: {
    fontSize: 12,
    color: '#A1A1AA',
    marginRight: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#27272A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
    marginLeft: 12,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#18181B',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
    gap: 8,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#27272A',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    color: '#FAFAFA',
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: '#71717A',
  },
  completeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
  },
  completeButtonDone: {
    backgroundColor: '#27272A',
  },
  completeButtonText: {
    fontSize: 14,
    color: '#FAFAFA',
    fontWeight: '600',
  },
})
