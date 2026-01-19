import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeInLeft, FadeInRight, useAnimatedStyle, useSharedValue, withTiming, withDelay, Easing } from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../hooks/useTheme'
import { useCardAnimation, useFloatingAnimation } from '../../hooks/useAnimations'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface DashboardStats {
  availableCourses: number
  completedLessons: number
  totalLessons: number
  overallProgress: number
}

// Animated Progress Bar Component
function AnimatedProgressBar({ progress, delay, color }: { progress: number, delay: number, color: string }) {
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withDelay(delay, withTiming(progress, { duration: 1000, easing: Easing.out(Easing.cubic) }))
  }, [progress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  return (
    <Animated.View style={[styles.progressBarFill, { backgroundColor: color }, animatedStyle]} />
  )
}

// Animated Stat Card Component
function StatCard({
  label,
  value,
  index,
  colors,
  progress,
  badge,
  badgeActive,
}: {
  label: string
  value: string | number
  index: number
  colors: any
  progress?: number
  badge?: string
  badgeActive?: boolean
}) {
  const { animatedStyle, onPressIn, onPressOut } = useCardAnimation()

  return (
    <Animated.View
      entering={FadeInUp.delay(300 + index * 100).duration(500).springify()}
      style={styles.statCard}
    >
      <AnimatedTouchable
        style={[
          styles.statCardInner,
          { backgroundColor: colors.card, borderColor: colors.border },
          animatedStyle,
        ]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        {badge ? (
          <View
            style={[
              styles.subscriptionBadge,
              badgeActive
                ? { backgroundColor: `${colors.primary}20` }
                : { backgroundColor: `${colors.textSecondary}20` },
            ]}>
            <Text
              style={[
                styles.subscriptionBadgeText,
                { color: badgeActive ? colors.primary : colors.textSecondary },
              ]}>
              {badge}
            </Text>
          </View>
        ) : (
          <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        )}
        {progress !== undefined && (
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <AnimatedProgressBar progress={progress} delay={600 + index * 100} color={colors.primary} />
          </View>
        )}
      </AnimatedTouchable>
    </Animated.View>
  )
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { user, profile, hasActiveSubscription } = useAuthStore()
  const colors = useTheme()
  const [stats, setStats] = useState<DashboardStats>({
    availableCourses: 0,
    completedLessons: 0,
    totalLessons: 0,
    overallProgress: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { animatedStyle: quickActionStyle, onPressIn, onPressOut } = useCardAnimation()
  const floatingStyle = useFloatingAnimation(6, 3500)

  const loadStats = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
        p_user_id: user.id,
      })

      if (error) {
        console.error('Error loading stats:', error)
        return
      }

      if (data) {
        setStats({
          availableCourses: data.total_courses || 0,
          completedLessons: data.completed_lessons || 0,
          totalLessons: data.total_lessons || 0,
          overallProgress: Math.round(data.average_progress || 0),
        })
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [user])

  const onRefresh = async () => {
    setIsRefreshing(true)
    await loadStats()
    setIsRefreshing(false)
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }>
      {/* Background Glow Effects */}
      <Animated.View
        style={[
          styles.glowOrb,
          styles.glowOrb1,
          { backgroundColor: colors.primary },
          floatingStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.glowOrb,
          styles.glowOrb2,
          { backgroundColor: colors.accent },
        ]}
      />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.header}
      >
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting()},</Text>
        <Animated.Text
          entering={FadeInLeft.delay(200).duration(500)}
          style={[styles.userName, { color: colors.text }]}
        >
          {profile?.full_name || 'Estudante'}
        </Animated.Text>
      </Animated.View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Cursos Disponiveis"
          value={stats.availableCourses}
          index={0}
          colors={colors}
        />
        <StatCard
          label="Aulas Concluidas"
          value={`${stats.completedLessons}/${stats.totalLessons}`}
          index={1}
          colors={colors}
        />
        <StatCard
          label="Progresso Geral"
          value={`${stats.overallProgress}%`}
          index={2}
          colors={colors}
          progress={stats.overallProgress}
        />
        <StatCard
          label="Status da Assinatura"
          value=""
          index={3}
          colors={colors}
          badge={hasActiveSubscription ? '✓ Ativa' : 'Inativa'}
          badgeActive={hasActiveSubscription}
        />
      </View>

      {/* Quick Actions */}
      <Animated.Text
        entering={FadeIn.delay(700).duration(400)}
        style={[styles.sectionTitle, { color: colors.text }]}
      >
        Acesso Rapido
      </Animated.Text>

      <AnimatedTouchable
        entering={FadeInUp.delay(800).duration(500).springify()}
        style={[
          styles.quickAction,
          { backgroundColor: colors.card, borderColor: colors.border },
          quickActionStyle,
        ]}
        onPress={() => navigation.navigate('Courses')}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Animated.Text entering={FadeIn.delay(900)} style={styles.quickActionIcon}>📚</Animated.Text>
        <View style={styles.quickActionInfo}>
          <Text style={[styles.quickActionTitle, { color: colors.text }]}>Continuar Estudando</Text>
          <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>
            Acesse seus cursos e aulas
          </Text>
        </View>
        <Animated.Text
          entering={FadeInRight.delay(1000).duration(400)}
          style={[styles.quickActionArrow, { color: colors.primary }]}
        >
          →
        </Animated.Text>
      </AnimatedTouchable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  glowOrb1: {
    width: 250,
    height: 250,
    top: -50,
    right: -80,
  },
  glowOrb2: {
    width: 200,
    height: 200,
    bottom: 50,
    left: -80,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  subscriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subscriptionIconText: {
    fontSize: 20,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statCardInner: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  subscriptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  subscriptionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  quickActionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  quickActionArrow: {
    fontSize: 20,
  },
})
