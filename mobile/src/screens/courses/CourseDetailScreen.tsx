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
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../stores/authStore'
import { useCourses } from '../../hooks/useCourses'
import { useTheme } from '../../hooks/useTheme'
import type { CoursesScreenProps } from '../../navigation/types'
import type { Course, Lesson, UserProgress } from '../../types/database'

interface LessonWithProgress extends Lesson {
  progress?: UserProgress | null
}

export default function CourseDetailScreen() {
  const route = useRoute<CoursesScreenProps<'CourseDetail'>['route']>()
  const navigation = useNavigation<CoursesScreenProps<'CourseDetail'>['navigation']>()
  const { courseId } = route.params
  const { user, hasActiveSubscription } = useAuthStore()
  const { fetchCourseDetails, isLoading } = useCourses()
  const colors = useTheme()
  const insets = useSafeAreaInsets()

  // Padding extra para Android que nao tem safe area no bottom
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
        'Voce precisa de uma assinatura ativa para acessar o conteudo.',
        [{ text: 'OK' }],
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!course) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>Curso nao encontrado</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: 32 + bottomPadding }]}>
      {/* Course Header */}
      {course.cover_url ? (
        <Image
          source={{ uri: course.cover_url }}
          style={[styles.cover, { backgroundColor: colors.border }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: colors.border }]}>
          <Text style={styles.coverPlaceholderText}>📚</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]}>{course.title}</Text>
        {course.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>{course.description}</Text>
        )}

        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progresso</Text>
            <Text style={[styles.progressValue, { color: colors.text }]}>
              {completedCount} de {lessons.length} aulas
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <View
              style={[styles.progressBar, { width: `${progressPercent}%`, backgroundColor: colors.primary }]}
            />
          </View>
          <Text style={[styles.progressPercent, { color: colors.primary }]}>{progressPercent}% completo</Text>
        </View>

        {/* Subscription Warning */}
        {!hasActiveSubscription && (
          <View style={[styles.warningCard, { backgroundColor: `${colors.error}15`, borderColor: `${colors.error}50` }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningInfo}>
              <Text style={[styles.warningTitle, { color: colors.text }]}>Assinatura Necessaria</Text>
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                Assine para acessar o conteudo completo
              </Text>
            </View>
          </View>
        )}

        {/* Lessons List */}
        <Text style={[styles.lessonsTitle, { color: colors.text }]}>Aulas</Text>
        {lessons.map((lesson, index) => (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              lesson.progress?.is_completed && { borderColor: `${colors.primary}50` },
            ]}
            onPress={() => handleLessonPress(lesson)}
            activeOpacity={0.7}>
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
                  <Text style={[styles.lessonProgress, { color: colors.primary }]}>
                    {lesson.progress.progress_percent}% lido
                  </Text>
                )}
              </View>
            </View>
            <Text style={[styles.lessonArrow, { color: colors.textTertiary }]}>→</Text>
          </TouchableOpacity>
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
    // paddingBottom is set dynamically based on safe area
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
