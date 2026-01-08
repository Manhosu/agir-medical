import React, { useEffect, useMemo } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreenProtection } from './src/utils/contentProtection'
import { useThemeStore, themes } from './src/stores/themeStore'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  const { mode, initialize } = useThemeStore()
  const colors = themes[mode]

  useEffect(() => {
    // Inicializar tema salvo
    initialize()
    // Habilitar protecao de tela quando o app inicia
    enableScreenProtection()
  }, [])

  // Tema de navegacao dinamico - React Navigation v7
  const navigationTheme = useMemo(() => ({
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    dark: mode === 'dark',
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  }), [mode, colors])

  return (
    <SafeAreaProvider>
      <StatusBar
        style={mode === 'dark' ? 'light' : 'dark'}
        backgroundColor={colors.background}
      />
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
