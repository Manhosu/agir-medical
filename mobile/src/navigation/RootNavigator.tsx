import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import type { RootStackParamList } from './types'

import { useAuthStore } from '../stores/authStore'
import AuthNavigator from './AuthNavigator'
import MainNavigator from './MainNavigator'
import { useTheme } from '../hooks/useTheme'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { isLoading, isAuthenticated, initialize } = useAuthStore()
  const colors = useTheme()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default RootNavigator
