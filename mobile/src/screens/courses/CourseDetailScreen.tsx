import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../stores/authStore'
import { useCourses } from '../../hooks/useCourses'
import { useTheme } from '../../hooks/useTheme'
import type { CoursesScreenProps } from '../../navigation/types'
import type { Course, Lesson, UserProgress } from '../../types/database'
import { URLS } from '../../config/urls'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

// Funcao para abrir pagina de planos no navegador
const openPlansPage = async () => {
  try {
    const canOpen = await Linking.canOpenURL(URLS.PLANS)
    if (canOpen) {
      await Linking.openURL(URLS.PLANS)
    } else {
      Alert.alert('Erro', 'Nao foi possivel abrir o navegador.')
    }
  } catch (error) {
    console.error('Error opening plans URL:', error)
    Alert.alert('Erro', 'Nao foi possivel abrir a pagina de planos.')
  }
}

interface LessonWithProgress extends Lesson {
  progress?: UserProgress | null
}

// Animated Progress Bar
function AnimatedProgressBar({ progress, color, delay = 0 }: { progress: number, color: string, delay?: number }) {
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withDelay(delay, withTiming(progress, { duration: 1000, easing: Easing.out(Easing.cubic) }))
  }, [progress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  return <Animated.View style={[styles.progressBar, { backgroundColor: color }, animatedStyle]} />
}

// Animated Lesson Card
function LessonCard({
  lesson,
  index,
  colors,
  onPress,
}: {
  lesson: LessonWithProgress
  index: number
  colors: any
  onPress: () => void
}) {
  const scale = useSharedValue(1)

  const onPressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 })
  }

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View
      entering={FadeInUp.delay(400 + index * 80).duration(500).springify()}
    >
      <AnimatedTouchable
        style={[
          styles.lessonCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          lesson.progress?.is_completed && { borderColor: `${colors.primary}50` },
          animatedStyle,
        ]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Aula ${index + 1}: ${lesson.title}`}
        accessibilityHint={lesson.progress?.is_completed ? 'Aula concluida. Toque para revisar' : 'Toque para abrir a aula'}
      >
        <View
          style={[
            styles.lessonNumber,
            { backgroundColor: colors.border },
            lesson.progress?.is_completed && { backgroundColor: colors.primary },
          ]}>
          <Text
            style={[
              styles.lessonNumberText,
              { color: colors.textSecondary },
              lesson.progress?.is_completed && { color: colors.text },
            ]}>
            {lesson.progress?.is_completed ? '✓' : String(index + 1).padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.lessonInfo}>
          <Text
            style={[
              styles.lessonTitle,
              { color: colors.text },
              lesson.progress?.is_completed && { color: colors.textSecondary },
            ]}
            numberOfLines={2}>
            {lesson.title}
          </Text>
          <View style={styles.lessonMeta}>
            {lesson.estimated_time && (
              <Text style={[styles.lessonDuration, { color: colors.textTertiary }]}>
                {lesson.estimated_time} min
              </Text>
            )}
            {lesson.progress && !lesson.progress.is_completed && (
              <Animated.Text
                entering={FadeIn.delay(600 + index * 80)}
                style={[styles.lessonProgress, { color: colors.primary }]}
              >
                {lesson.progress.progress_percent}% lido
              </Animated.Text>
            )}
          </View>
        </View>
        <Animated.Text
          entering={FadeInLeft.delay(500 + index * 80).duration(300)}
          style={[styles.lessonArrow, { color: colors.textTertiary }]}
        >
          →
        </Animated.Text>
      </AnimatedTouchable>
    </Animated.View>
  )
}

export default function CourseDetailScreen() {
  const route = useRoute<CoursesScreenProps<'CourseDetail'>['route']>()
  const navigation = useNavigation<CoursesScreenProps<'CourseDetail'>['navigation']>()
  const { courseId } = route.params
  const { user, hasActiveSubscription } = useAuthStore()
  const { fetchCourseDetails, isLoading } = useCourses()
  const colors = useTheme()
  const insets = useSafeAreaInsets()

  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<LessonWithProgress[]>([])

  useEffect(() => {
    loadCourseDetails()
  }, [courseId])

  const loadCourseDetails = async () => {
    if (!user) return

    const result = await fetchCourseDetails(courseId, user.id)
    if (result) {
      setCourse(result.course)
      setLessons(result.lessons)
      navigation.setOptions({ title: result.course.title })
    }
  }

  const handleLessonPress = (lesson: LessonWithProgress) => {
    if (!hasActiveSubscription) {
      Alert.alert(
        'Assinatura Necessaria',
        'Voce precisa de uma assinatura ativa para acessar o conteudo completo do Programa A.G.I.R.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Assinar Agora',
            onPress: openPlansPage,
            style: 'default',
          },
        ],
      )
      return
    }

    navigation.navigate('LessonViewer', {
      courseId,
      lessonId: lesson.id,
    })
  }

  const completedCount = lessons.filter(l => l.progress?.is_completed).length
  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Animated.View entering={FadeIn.duration(400)}>
          <ActivityIndicator size="large" color={colors.primary} />
        </Animated.View>
      </View>
    )
  }

  if (!course) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Animated.Text entering={FadeIn.duration(400)} style={styles.errorIcon}>⚠️</Animated.Text>
        <Animated.Text entering={FadeIn.delay(200).duration(400)} style={[styles.errorText, { color: colors.textSecondary }]}>
          Curso nao encontrado
        </Animated.Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: 32 + bottomPadding }]}>
      {/* Course Header */}
      {course.cover_url ? (
        <Animated.Image
          entering={FadeIn.duration(500)}
          source={{ uri: course.cover_url }}
          style={[styles.cover, { backgroundColor: colors.border }]}
          resizeMode="cover"
        />
      ) : (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={[styles.coverPlaceholder, { backgroundColor: colors.border }]}
        >
          <Text style={styles.coverPlaceholderText}>📚</Text>
        </Animated.View>
      )}

      <View style={styles.info}>
        <Animated.Text
          entering={FadeInUp.delay(100).duration(500)}
          style={[styles.title, { color: colors.text }]}
        >
          {course.title}
        </Animated.Text>
        {course.description && (
          <Animated.Text
            entering={FadeIn.delay(200).duration(500)}
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {course.description}
          </Animated.Text>
        )}

        {/* Progress Card */}
        <Animated.View
          entering={FadeInUp.delay(250).duration(500).springify()}
          style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.progressInfo}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progresso</Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>
              {completedCount} de {lessons.length} aulas
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <AnimatedProgressBar progress={progressPercent} color={colors.primary} delay={400} />
          </View>
          <Animated.Text
            entering={FadeIn.delay(600).duration(400)}
            style={[styles.progressPercent, { color: colors.primary }]}
          >
            {progressPercent}% completo
          </Animated.Text>
        </Animated.View>

        {/* Subscription Warning */}
        {!hasActiveSubscription && (
          <TouchableOpacity onPress={openPlansPage} activeOpacity={0.8}>
            <Animated.View
              entering={FadeIn.delay(350).duration(500).springify()}
              style={[styles.warningCard, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}50` }]}
            >
              <Text style={styles.warningIcon}>🔒</Text>
              <View style={styles.warningInfo}>
                <Text style={[styles.warningTitle, { color: colors.text }]}>Assinatura Necessaria</Text>
                <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                  Toque aqui para assinar e liberar o conteudo
                </Text>
              </View>
              <Text style={[styles.warningArrow, { color: colors.primary }]}>→</Text>
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* Lessons List */}
        <Animated.Text
          entering={FadeInUp.delay(400).duration(400)}
          style={[styles.lessonsTitle, { color: colors.text }]}
        >
          Aulas
        </Animated.Text>
        {lessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={index}
            colors={colors}
            onPress={() => handleLessonPress(lesson)}
          />
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
  },
  cover: {
    width: '100%',
    height: 200,
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontSize: 64,
  },
  info: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    textAlign: 'right',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningInfo: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    marginTop: 2,
  },
  warningArrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonDuration: {
    fontSize: 12,
  },
  lessonProgress: {
    fontSize: 12,
  },
  lessonArrow: {
    fontSize: 16,
  },
})
