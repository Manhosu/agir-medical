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
  Linking,
} from 'react-native'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  Layout,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useAuthStore } from '../../stores/authStore'
import { useCourses } from '../../hooks/useCourses'
import { useTheme } from '../../hooks/useTheme'
import type { CoursesScreenProps } from '../../navigation/types'
import { URLS } from '../../config/urls'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

// Funcao para abrir pagina de planos no navegador
const openPlansPage = async () => {
  try {
    await Linking.openURL(URLS.PLANS)
  } catch (error) {
    console.error('Error opening plans URL:', error)
  }
}

// Animated Progress Bar for Course Cards
function AnimatedCourseProgress({ progress, color }: { progress: number, color: string }) {
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withDelay(200, withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) }))
  }, [progress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  return <Animated.View style={[styles.progressBar, { backgroundColor: color }, animatedStyle]} />
}

// Animated Course Card Component
function CourseCard({
  item,
  index,
  colors,
  onPress,
}: {
  item: any
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

  const imageUrl = item.thumbnail_url || item.cover_url

  return (
    <Animated.View
      entering={FadeInUp.delay(100 + index * 80).duration(500).springify()}
      layout={Layout.springify()}
    >
      <AnimatedTouchable
        style={[
          styles.courseCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          animatedStyle,
        ]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Curso: ${item.title}`}
        accessibilityHint={`Progresso: ${item.progressPercent}%. Toque para abrir o curso`}
      >
        {imageUrl ? (
          <Animated.Image
            entering={FadeIn.delay(200 + index * 80).duration(400)}
            source={{ uri: imageUrl }}
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
            <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
              <AnimatedCourseProgress progress={item.progressPercent} color={colors.primary} />
            </View>
            <Text style={[styles.progressText, { color: colors.primary }]}>{item.progressPercent}%</Text>
          </View>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  )
}

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

  const renderCourse = ({ item, index }: { item: typeof courses[0], index: number }) => (
    <CourseCard
      item={item}
      index={index}
      colors={colors}
      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
    />
  )

  const renderEmpty = () => (
    <Animated.View
      entering={FadeIn.delay(300).duration(500)}
      style={styles.emptyContainer}
    >
      <Animated.Text
        entering={FadeInDown.delay(400).duration(400)}
        style={styles.emptyIcon}
      >
        📚
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(500).duration(400)}
        style={[styles.emptyTitle, { color: colors.text }]}
      >
        Nenhum curso disponivel
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(600).duration(400)}
        style={[styles.emptyDescription, { color: colors.textSecondary }]}
      >
        Em breve teremos novos cursos para voce
      </Animated.Text>
    </Animated.View>
  )

  const renderHeader = () => (
    <Animated.View
      entering={FadeInDown.delay(100).duration(500)}
      style={styles.header}
    >
      <Animated.Text
        entering={FadeIn.delay(200).duration(400)}
        style={[styles.headerTitle, { color: colors.text }]}
      >
        Cursos
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(300).duration(400)}
        style={[styles.headerSubtitle, { color: colors.textSecondary }]}
      >
        {hasActiveSubscription
          ? 'Acesse todos os cursos disponiveis'
          : 'Assine para ter acesso completo'}
      </Animated.Text>

      {/* Subscription CTA Banner */}
      {!hasActiveSubscription && (
        <TouchableOpacity
          onPress={openPlansPage}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Assinar plano"
          accessibilityHint="Toque para ver os planos de assinatura">
          <Animated.View
            entering={FadeInUp.delay(400).duration(500).springify()}
            style={[styles.subscriptionBanner, { backgroundColor: colors.primary }]}
          >
            <View style={styles.subscriptionBannerContent}>
              <Text style={[styles.subscriptionBannerTitle, { color: colors.primaryForeground }]}>
                Desbloqueie todo o conteudo
              </Text>
              <Text style={[styles.subscriptionBannerText, { color: colors.primaryForeground }]}>
                Assine agora e tenha acesso completo ao metodo A.G.I.R.
              </Text>
            </View>
            <Text style={[styles.subscriptionBannerArrow, { color: colors.primaryForeground }]}>→</Text>
          </Animated.View>
        </TouchableOpacity>
      )}
    </Animated.View>
  )

  if (isLoading && courses.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Animated.View entering={FadeIn.duration(400)}>
          <ActivityIndicator size="large" color={colors.primary} />
        </Animated.View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Background Glow */}
      <Animated.View
        entering={FadeIn.delay(50).duration(800)}
        style={[
          styles.glowOrb,
          { backgroundColor: colors.primary },
        ]}
      />

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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -100,
    opacity: 0.08,
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
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  subscriptionBannerContent: {
    flex: 1,
  },
  subscriptionBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subscriptionBannerText: {
    fontSize: 13,
    opacity: 0.9,
  },
  subscriptionBannerArrow: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 12,
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
