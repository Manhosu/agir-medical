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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

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
        {/* Cover com titulo overlay */}
        <View style={styles.coverContainer}>
          <Animated.Image
            entering={FadeIn.delay(200 + index * 80).duration(400)}
            source={imageUrl ? { uri: imageUrl } : require('../../../assets/course-cover.png')}
            style={[styles.courseCover, { backgroundColor: colors.border }]}
            resizeMode="cover"
          />
          {/* Gradient overlay (simulated with two layers) */}
          <View style={styles.coverGradient} />
          <View style={styles.coverGradientBottom} />
          {/* Linha verde decorativa no topo */}
          <View style={[styles.coverAccentLine, { backgroundColor: colors.primary }]} />
          {/* Titulo sobre a imagem */}
          <View style={styles.coverTitleContainer}>
            <Text style={styles.coverTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.coverSubtitle}>Programa A.G.I.R.</Text>
          </View>
        </View>
        <View style={styles.courseInfo}>
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
        Nenhum curso disponível
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(600).duration(400)}
        style={[styles.emptyDescription, { color: colors.textSecondary }]}
      >
        Em breve teremos novos cursos para você
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
          ? 'Acesse todos os cursos disponíveis'
          : 'Sua conta não possui acesso ativo'}
      </Animated.Text>

      {/* Info card para conta sem acesso */}
      {!hasActiveSubscription && (
        <Animated.View
          entering={FadeInUp.delay(400).duration(500).springify()}
          style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.subscriptionBannerContent}>
            <Text style={[styles.subscriptionBannerTitle, { color: colors.text }]}>
              Acesso indisponível
            </Text>
            <Text style={[styles.subscriptionBannerText, { color: colors.textSecondary }]}>
              Para ativar seu acesso, entre em contato com o suporte: contato@programa-agir.com.br
            </Text>
          </View>
        </Animated.View>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
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
  courseCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  coverContainer: {
    position: 'relative' as const,
    width: '100%',
    height: 180,
  },
  courseCover: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  coverGradientBottom: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  coverAccentLine: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.7,
  },
  coverTitleContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  coverTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  coverSubtitle: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(2,136,74,0.8)',
    marginTop: 3,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
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
