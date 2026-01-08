import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import type { RootStackParamList } from './types'

import { useAuthStore } from '../stores/authStore'
import AuthNavigator from './AuthNavigator'
import MainNavigator from './MainNavigator'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { isLoading, isAuthenticated, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    )
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0B' },
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
    backgroundColor: '#0A0A0B',
  },
})

export default RootNavigator
