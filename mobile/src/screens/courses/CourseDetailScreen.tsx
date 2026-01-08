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
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useAuthStore } from '../../stores/authStore'
import { useCourses } from '../../hooks/useCourses'
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    )
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Curso nao encontrado</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Course Header */}
      {course.cover_url ? (
        <Image
          source={{ uri: course.cover_url }}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverPlaceholderText}>📚</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{course.title}</Text>
        {course.description && (
          <Text style={styles.description}>{course.description}</Text>
        )}

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text style={styles.progressValue}>
              {completedCount} de {lessons.length} aulas
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.progressPercent}>{progressPercent}% completo</Text>
        </View>

        {/* Subscription Warning */}
        {!hasActiveSubscription && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningInfo}>
              <Text style={styles.warningTitle}>Assinatura Necessaria</Text>
              <Text style={styles.warningText}>
                Assine para acessar o conteudo completo
              </Text>
            </View>
          </View>
        )}

        {/* Lessons List */}
        <Text style={styles.lessonsTitle}>Aulas</Text>
        {lessons.map((lesson, index) => (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonCard,
              lesson.progress?.is_completed && styles.lessonCardCompleted,
            ]}
            onPress={() => handleLessonPress(lesson)}
            activeOpacity={0.7}>
            <View
              style={[
                styles.lessonNumber,
                lesson.progress?.is_completed && styles.lessonNumberCompleted,
              ]}>
              <Text
                style={[
                  styles.lessonNumberText,
                  lesson.progress?.is_completed && styles.lessonNumberTextCompleted,
                ]}>
                {lesson.progress?.is_completed ? '✓' : String(index + 1).padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.lessonInfo}>
              <Text
                style={[
                  styles.lessonTitle,
                  lesson.progress?.is_completed && styles.lessonTitleCompleted,
                ]}
                numberOfLines={2}>
                {lesson.title}
              </Text>
              <View style={styles.lessonMeta}>
                {lesson.estimated_time && (
                  <Text style={styles.lessonDuration}>
                    {lesson.estimated_time} min
                  </Text>
                )}
                {lesson.progress && !lesson.progress.is_completed && (
                  <Text style={styles.lessonProgress}>
                    {lesson.progress.progress_percent}% lido
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.lessonArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  content: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0B',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#A1A1AA',
  },
  cover: {
    width: '100%',
    height: 200,
    backgroundColor: '#27272A',
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#27272A',
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
    color: '#FAFAFA',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 22,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  progressValue: {
    fontSize: 14,
    color: '#FAFAFA',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#22C55E',
    textAlign: 'right',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
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
    color: '#FAFAFA',
  },
  warningText: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FAFAFA',
    marginBottom: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  lessonCardCompleted: {
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberCompleted: {
    backgroundColor: '#22C55E',
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  lessonNumberTextCompleted: {
    color: '#FAFAFA',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FAFAFA',
    marginBottom: 4,
  },
  lessonTitleCompleted: {
    color: '#A1A1AA',
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#71717A',
  },
  lessonProgress: {
    fontSize: 12,
    color: '#22C55E',
  },
  lessonArrow: {
    fontSize: 16,
    color: '#71717A',
  },
})
