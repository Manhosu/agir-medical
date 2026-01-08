import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useAuthStore } from '../../stores/authStore'
import { useCourses } from '../../hooks/useCourses'
import { useTheme } from '../../hooks/useTheme'
import type { CoursesScreenProps } from '../../navigation/types'

export default function CoursesListScreen() {
  const navigation = useNavigation<CoursesScreenProps<'CoursesList'>['navigation']>()
  const { user, hasActiveSubscription } = useAuthStore()
  const { courses, isLoading, error, fetchCourses } = useCourses()
  const colors = useTheme()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const loadCourses = useCallback(async () => {
    if (user) {
      await fetchCourses(user.id)
    }
  }, [user, fetchCourses])

  useFocusEffect(
    useCallback(() => {
      loadCourses()
    }, [loadCourses]),
  )

  const onRefresh = async () => {
    setIsRefreshing(true)
    await loadCourses()
    setIsRefreshing(false)
  }

  const renderCourse = ({ item }: { item: typeof courses[0] }) => (
    <TouchableOpacity
      style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
      activeOpacity={0.7}>
      {item.cover_url ? (
        <Image
          source={{ uri: item.cover_url }}
          style={[styles.courseCover, { backgroundColor: colors.border }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.courseCoverPlaceholder, { backgroundColor: colors.border }]}>
          <Text style={styles.courseCoverPlaceholderText}>📚</Text>
        </View>
      )}
      <View style={styles.courseInfo}>
        <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={[styles.courseDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.courseStats}>
          <Text style={[styles.courseStat, { color: colors.textTertiary }]}>
            {item.totalLessons} aulas
          </Text>
          <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
            <View
              style={[styles.progressBar, { width: `${item.progressPercent}%`, backgroundColor: colors.primary }]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.primary }]}>{item.progressPercent}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum curso disponivel</Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Em breve teremos novos cursos para voce
      </Text>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Cursos</Text>
      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
        {hasActiveSubscription
          ? 'Acesse todos os cursos disponiveis'
          : 'Assine para ter acesso completo'}
      </Text>
    </View>
  )

  if (isLoading && courses.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={courses}
        keyExtractor={item => item.id}
        renderItem={renderCourse}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  courseCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  courseCover: {
    width: '100%',
    height: 160,
  },
  courseCoverPlaceholder: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseCoverPlaceholderText: {
    fontSize: 48,
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courseStat: {
    fontSize: 12,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
})
