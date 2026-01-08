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

interface DashboardStats {
  totalCourses: number
  completedCourses: number
  lessonsCompleted: number
  totalHours: number
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { user, profile, hasActiveSubscription } = useAuthStore()
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
      // Usar a função RPC do Supabase
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
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#22C55E"
        />
      }>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting()},</Text>
        <Text style={styles.userName}>
          {profile?.full_name || 'Estudante'}
        </Text>
      </View>

      {/* Subscription Status */}
      <View
        style={[
          styles.subscriptionCard,
          hasActiveSubscription ? styles.subscriptionActive : styles.subscriptionInactive,
        ]}>
        <View style={styles.subscriptionIcon}>
          <Text style={styles.subscriptionIconText}>
            {hasActiveSubscription ? '✓' : '!'}
          </Text>
        </View>
        <View style={styles.subscriptionInfo}>
          <Text style={styles.subscriptionTitle}>
            {hasActiveSubscription ? 'Assinatura Ativa' : 'Sem Assinatura'}
          </Text>
          <Text style={styles.subscriptionDescription}>
            {hasActiveSubscription
              ? 'Voce tem acesso a todos os cursos'
              : 'Assine para acessar o conteudo'}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Seu Progresso</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCourses}</Text>
          <Text style={styles.statLabel}>Cursos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedCourses}</Text>
          <Text style={styles.statLabel}>Concluidos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.lessonsCompleted}</Text>
          <Text style={styles.statLabel}>Aulas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalHours}h</Text>
          <Text style={styles.statLabel}>Estudadas</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Acesso Rapido</Text>
      <TouchableOpacity
        style={styles.quickAction}
        onPress={() => navigation.navigate('Courses')}>
        <Text style={styles.quickActionIcon}>📚</Text>
        <View style={styles.quickActionInfo}>
          <Text style={styles.quickActionTitle}>Continuar Estudando</Text>
          <Text style={styles.quickActionDescription}>
            Acesse seus cursos e aulas
          </Text>
        </View>
        <Text style={styles.quickActionArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#A1A1AA',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FAFAFA',
    marginTop: 4,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  subscriptionActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  subscriptionInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  subscriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#FAFAFA',
  },
  subscriptionDescription: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FAFAFA',
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
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22C55E',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 4,
    textAlign: 'center',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
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
    color: '#FAFAFA',
  },
  quickActionDescription: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 2,
  },
  quickActionArrow: {
    fontSize: 20,
    color: '#22C55E',
  },
})
