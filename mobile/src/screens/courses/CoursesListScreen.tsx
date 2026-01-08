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
import type { CoursesScreenProps } from '../../navigation/types'

export default function CoursesListScreen() {
  const navigation = useNavigation<CoursesScreenProps<'CoursesList'>['navigation']>()
  const { user, hasActiveSubscription } = useAuthStore()
  const { courses, isLoading, error, fetchCourses } = useCourses()
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
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
      activeOpacity={0.7}>
      {item.cover_url ? (
        <Image
          source={{ uri: item.cover_url }}
          style={styles.courseCover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.courseCoverPlaceholder}>
          <Text style={styles.courseCoverPlaceholderText}>📚</Text>
        </View>
      )}
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.courseDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.courseStats}>
          <Text style={styles.courseStat}>
            {item.totalLessons} aulas
          </Text>
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { width: `${item.progressPercent}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{item.progressPercent}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>Nenhum curso disponivel</Text>
      <Text style={styles.emptyDescription}>
        Em breve teremos novos cursos para voce
      </Text>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Cursos</Text>
      <Text style={styles.headerSubtitle}>
        {hasActiveSubscription
          ? 'Acesse todos os cursos disponiveis'
          : 'Assine para ter acesso completo'}
      </Text>
    </View>
  )

  if (isLoading && courses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
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
            tintColor="#22C55E"
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
    backgroundColor: '#0A0A0B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0B',
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
    color: '#FAFAFA',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 4,
  },
  courseCard: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  courseCover: {
    width: '100%',
    height: 160,
    backgroundColor: '#27272A',
  },
  courseCoverPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#27272A',
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
    color: '#FAFAFA',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#A1A1AA',
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
    color: '#71717A',
  },
  progressContainer: {
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
  progressText: {
    fontSize: 12,
    color: '#22C55E',
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
    color: '#FAFAFA',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
  },
})
