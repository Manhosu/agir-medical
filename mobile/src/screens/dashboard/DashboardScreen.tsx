import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../hooks/useTheme'

interface DashboardStats {
  availableCourses: number
  completedLessons: number
  totalLessons: number
  overallProgress: number
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

  const loadStats = async () => {
    if (!user) return

    try {
      // Usar a funcao RPC do Supabase
      const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
        p_user_id: user.id,
      })

      if (error) {
        console.error('Error loading stats:', error)
        return
      }

      if (data && data.length > 0) {
        setStats({
          availableCourses: data[0].total_courses || 0,
          completedLessons: data[0].completed_lessons || 0,
          totalLessons: data[0].total_lessons || 0,
          overallProgress: Math.round(data[0].average_progress || 0),
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting()},</Text>
        <Text style={[styles.userName, { color: colors.text }]}>
          {profile?.full_name || 'Estudante'}
        </Text>
      </View>

      {/* Stats Grid - igual desktop */}
      <View style={styles.statsGrid}>
        {/* Cursos Disponiveis */}
        <View style={styles.statCard}>
          <View style={[styles.statCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cursos Disponiveis</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.availableCourses}</Text>
          </View>
        </View>
        {/* Aulas Concluidas */}
        <View style={styles.statCard}>
          <View style={[styles.statCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Aulas Concluidas</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.completedLessons}/{stats.totalLessons}
            </Text>
          </View>
        </View>
        {/* Progresso Geral */}
        <View style={styles.statCard}>
          <View style={[styles.statCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Progresso Geral</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.overallProgress}%</Text>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${stats.overallProgress}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        </View>
        {/* Status da Assinatura */}
        <View style={styles.statCard}>
          <View style={[styles.statCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Status da Assinatura</Text>
            <View
              style={[
                styles.subscriptionBadge,
                hasActiveSubscription
                  ? { backgroundColor: `${colors.primary}20` }
                  : { backgroundColor: `${colors.textSecondary}20` },
              ]}>
              <Text
                style={[
                  styles.subscriptionBadgeText,
                  { color: hasActiveSubscription ? colors.primary : colors.textSecondary },
                ]}>
                {hasActiveSubscription ? '✓ Ativa' : 'Inativa'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Acesso Rapido</Text>
      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('Courses')}>
        <Text style={styles.quickActionIcon}>📚</Text>
        <View style={styles.quickActionInfo}>
          <Text style={[styles.quickActionTitle, { color: colors.text }]}>Continuar Estudando</Text>
          <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>
            Acesse seus cursos e aulas
          </Text>
        </View>
        <Text style={[styles.quickActionArrow, { color: colors.primary }]}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
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
