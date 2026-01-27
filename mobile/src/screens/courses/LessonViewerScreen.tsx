import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../stores/authStore'
import { useCourses } from '../../hooks/useCourses'
import { useTheme } from '../../hooks/useTheme'
import { supabase } from '../../lib/supabase'
import {
  enableScreenProtection,
  disableScreenProtection,
  addScreenshotListener,
} from '../../utils/contentProtection'
import type { CoursesScreenProps } from '../../navigation/types'
import type { Lesson, LessonContent } from '../../types/database'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function LessonViewerScreen() {
  const route = useRoute<CoursesScreenProps<'LessonViewer'>['route']>()
  const navigation = useNavigation<CoursesScreenProps<'LessonViewer'>['navigation']>()
  const { courseId, lessonId } = route.params
  const { user, profile, hasActiveSubscription } = useAuthStore()
  const { fetchLessonContent, saveProgress } = useCourses()
  const colors = useTheme()
  const insets = useSafeAreaInsets()

  // Padding extra para Android que nao tem safe area no bottom
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [content, setContent] = useState<string>('')
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayProgress, setDisplayProgress] = useState(0) // Progress shown in UI
  const [initialProgress, setInitialProgress] = useState(0) // Progress loaded from DB (for HTML)

  const webViewRef = useRef<WebView>(null)
  const progressSaveTimeout = useRef<NodeJS.Timeout | null>(null)
  const maxProgressRef = useRef(0) // Track max progress without causing re-renders

  // Habilitar protecao de tela ao entrar na aula
  useEffect(() => {
    enableScreenProtection()

    // Monitorar tentativas de screenshot
    const subscription = addScreenshotListener(() => {
      Alert.alert(
        'Aviso',
        'A captura de tela nao e permitida nesta secao.',
        [{ text: 'OK' }],
      )
    })

    return () => {
      disableScreenProtection()
      subscription?.remove()
    }
  }, [])

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

      // Carregar conteudo
      const contentData = await fetchLessonContent(lessonId)
      setContent(contentData?.content_html || '<p>Conteudo nao disponivel.</p>')

      // Carregar todas as aulas do curso para navegacao
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
          setDisplayProgress(progressData.progress_percent)
          setInitialProgress(progressData.progress_percent)
          maxProgressRef.current = progressData.progress_percent
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error)
      Alert.alert('Erro', 'Erro ao carregar aula')
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar progresso com debounce - APENAS se for maior que o atual
  // Usa ref para evitar re-renders durante scroll
  const handleProgressUpdate = useCallback(
    (newProgress: number) => {
      // Apenas atualizar se o novo progresso for MAIOR que o maximo registrado
      if (newProgress <= maxProgressRef.current) {
        return // Nao regredir o progresso
      }

      maxProgressRef.current = newProgress

      // Atualizar UI com debounce para evitar muitos re-renders
      if (progressSaveTimeout.current) {
        clearTimeout(progressSaveTimeout.current)
      }

      progressSaveTimeout.current = setTimeout(() => {
        // Atualizar display progress
        setDisplayProgress(newProgress)

        // Salvar no banco
        if (user) {
          saveProgress(user.id, lessonId, newProgress)
        }
      }, 500) // Atualiza UI a cada 500ms no maximo
    },
    [user, lessonId, saveProgress],
  )

  // Indice da aula atual para exibicao
  const currentIndex = allLessons.findIndex(l => l.id === lessonId)

  const markAsCompleted = async () => {
    if (user) {
      await saveProgress(user.id, lessonId, 100)
      setDisplayProgress(100)
      maxProgressRef.current = 100
      Alert.alert('Sucesso', 'Aula marcada como concluida!')
    }
  }

  // Email do usuario para watermark
  const watermarkEmail = profile?.email || user?.email || 'Usuario'

  // HTML para o WebView com protecoes e cores dinamicas
  // Memoizado para nao recriar durante scroll (evita reload do WebView)
  const htmlContent = useMemo(() => `
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
          background-color: ${colors.background};
          color: ${colors.text};
          padding: 16px;
          padding-bottom: 100px;
          margin: 0;
          line-height: 1.6;
          font-size: 16px;
        }
        h1, h2, h3 {
          color: ${colors.text};
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
          color: ${colors.primary};
        }
        .watermark {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1000;
          overflow: hidden;
        }
        .watermark-text {
          position: absolute;
          white-space: nowrap;
          font-size: 11px;
          font-weight: 600;
          color: rgba(128, 128, 128, 0.45);
          text-shadow: 0 0 2px rgba(255,255,255,0.3), 0 0 2px rgba(0,0,0,0.3);
          transform: rotate(-30deg);
          opacity: 0.85;
        }
        .watermark-center {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 14px;
          font-weight: 700;
          color: rgba(128, 128, 128, 0.5);
          text-shadow: 0 0 3px rgba(255,255,255,0.4), 0 0 3px rgba(0,0,0,0.4);
          white-space: nowrap;
          pointer-events: none;
          z-index: 1001;
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="watermark">
        ${Array.from({ length: 30 })
          .map(
            (_, i) =>
              `<div class="watermark-text" style="top: ${(i * 3.5) % 100}%; left: ${(i * 5) % 100}%;">${watermarkEmail}</div>`,
          )
          .join('')}
      </div>
      <div class="watermark-center">${watermarkEmail}</div>
      <div class="content">
        ${content}
      </div>
      <script>
        // Track maximum progress locally in WebView
        let maxScrollProgress = ${initialProgress};

        // Reportar scroll progress - com throttle
        let lastReportTime = 0;
        const THROTTLE_MS = 300;

        document.addEventListener('scroll', function() {
          const now = Date.now();
          if (now - lastReportTime < THROTTLE_MS) return;

          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentProgress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
          const progress = Math.min(100, Math.max(0, currentProgress));

          // Apenas reportar se o progresso AUMENTOU
          if (progress > maxScrollProgress) {
            maxScrollProgress = progress;
            lastReportTime = now;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scroll', progress: maxScrollProgress }));
          }
        }, { passive: true });

        // Bloquear menu de contexto
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
        });

        // Bloquear copia
        document.addEventListener('copy', function(e) {
          e.preventDefault();
        });
      </script>
    </body>
    </html>
  `, [content, colors.background, colors.text, colors.primary, watermarkEmail, initialProgress])

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'scroll') {
        handleProgressUpdate(data.progress)
      }
    } catch (e) {
      // Ignorar mensagens nao-JSON
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando conteudo...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Header */}
      <View style={[styles.progressHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Aula {currentIndex + 1} de {allLessons.length}
        </Text>
        <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
          <View style={[styles.progressBar, { width: `${displayProgress}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressPercent, { color: colors.primary }]}>{displayProgress}%</Text>
      </View>

      {/* Content */}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={[styles.webview, { backgroundColor: colors.background }]}
        onMessage={handleWebViewMessage}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Desabilitar gestos de zoom
        scalesPageToFit={false}
        bounces={false}
      />

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: 12 + bottomPadding }]}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            { backgroundColor: displayProgress >= 90 ? colors.primary : colors.border },
            displayProgress >= 100 && { backgroundColor: colors.border },
          ]}
          onPress={markAsCompleted}
          disabled={displayProgress < 90 || displayProgress >= 100}>
          <Text style={[styles.completeButtonText, { color: displayProgress >= 90 ? colors.text : colors.textTertiary }]}>
            {displayProgress >= 100 ? '✓ Concluida' : displayProgress >= 90 ? 'Concluir' : `Leia ate o fim (${displayProgress}%)`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  progressText: {
    fontSize: 12,
    marginRight: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
  },
  webview: {
    flex: 1,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
  },
  completeButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
