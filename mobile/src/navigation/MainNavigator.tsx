import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { MainTabParamList } from './types'

import DashboardScreen from '../screens/dashboard/DashboardScreen'
import CoursesNavigator from './CoursesNavigator'
import ProfileScreen from '../screens/profile/ProfileScreen'
import { useTheme } from '../hooks/useTheme'

// Telas onde a tab bar deve ficar escondida
const HIDDEN_TAB_SCREENS = ['CourseDetail', 'LessonViewer']

const Tab = createBottomTabNavigator<MainTabParamList>()

// Icones simples usando texto (em producao usar react-native-vector-icons ou similar)
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏠',
    Courses: '📚',
    Profile: '👤',
  }

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '○'}
      </Text>
    </View>
  )
}

export function MainNavigator() {
  const colors = useTheme()
  const insets = useSafeAreaInsets()

  // Android com navegacao por botoes precisa de padding extra
  // Minimo de 20 para garantir que nao fique embaixo da barra de navegacao
  const androidBottomPadding = Math.max(insets.bottom, 20)
  const tabBarHeight = Platform.OS === 'android' ? 60 + androidBottomPadding : 60 + insets.bottom
  const tabBarPaddingBottom = Platform.OS === 'android' ? androidBottomPadding : Math.max(insets.bottom, 5)

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          height: tabBarHeight,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" focused={focused} />,
          tabBarAccessibilityLabel: 'Tela inicial',
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'CoursesList'
          const shouldHideTabBar = HIDDEN_TAB_SCREENS.includes(routeName)

          return {
            title: 'Cursos',
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon name="Courses" focused={focused} />,
            tabBarStyle: shouldHideTabBar ? { display: 'none' } : {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingBottom: tabBarPaddingBottom,
              paddingTop: 8,
              height: tabBarHeight,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            },
          }
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
          tabBarAccessibilityLabel: 'Meu perfil',
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
})

export default MainNavigator
