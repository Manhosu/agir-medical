import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, StyleSheet } from 'react-native'
import type { MainTabParamList } from './types'

import DashboardScreen from '../screens/dashboard/DashboardScreen'
import CoursesNavigator from './CoursesNavigator'
import ProfileScreen from '../screens/profile/ProfileScreen'
import { useTheme } from '../hooks/useTheme'

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
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
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
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesNavigator}
        options={{
          title: 'Cursos',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="Courses" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
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
