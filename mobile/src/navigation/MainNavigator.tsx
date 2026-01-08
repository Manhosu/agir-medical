import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, StyleSheet } from 'react-native'
import type { MainTabParamList } from './types'

import DashboardScreen from '../screens/dashboard/DashboardScreen'
import CoursesNavigator from './CoursesNavigator'
import ProfileScreen from '../screens/profile/ProfileScreen'

const Tab = createBottomTabNavigator<MainTabParamList>()

// Ícones simples usando texto (em produção usar react-native-vector-icons ou similar)
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
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A0A0B',
          borderBottomWidth: 1,
          borderBottomColor: '#27272A',
        },
        headerTintColor: '#FAFAFA',
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#0A0A0B',
          borderTopColor: '#27272A',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#71717A',
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
