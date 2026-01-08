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
  totalCourses: number
  completedCourses: number
  lessonsCompleted: number
  totalHours: number
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { user, profile, hasActiveSubscription } = useAuthStore()
  const colors = useTheme()
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    lessonsCompleted: 0,
    totalHours: 0,
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
          totalCourses: data[0].enrolled_courses || 0,
          completedCourses: data[0].completed_courses || 0,
          lessonsCompleted: data[0].completed_lessons || 0,
          totalHours: Math.round((data[0].total_hours || 0) / 60),
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

      {/* Subscription Status */}
      <View
        style={[
          styles.subscriptionCard,
          hasActiveSubscription
            ? { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}50` }
            : { backgroundColor: `${colors.error}15`, borderColor: `${colors.error}50` },
        ]}>
        <View style={[styles.subscriptionIcon, { backgroundColor: `${colors.text}15` }]}>
          <Text style={styles.subscriptionIconText}>
            {hasActiveSubscription ? '✓' : '!'}
          </Text>
        </View>
        <View style={styles.subscriptionInfo}>
          <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
            {hasActiveSubscription ? 'Assinatura Ativa' : 'Sem Assinatura'}
          </Text>
          <Text style={[styles.subscriptionDescription, { color: colors.textSecondary }]}>
            {hasActiveSubscription
              ? 'Voce tem acesso a todos os cursos'
              : 'Assine para acessar o conteudo'}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Seu Progresso</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalCourses}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cursos</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.completedCourses}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Concluidos</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.lessonsCompleted}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Aulas</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalHours}h</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Estudadas</Text>
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
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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
