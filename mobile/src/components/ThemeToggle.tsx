import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native'
import { useThemeStore, themes } from '../stores/themeStore'

interface ThemeToggleProps {
  showLabel?: boolean
}

export function ThemeToggle({ showLabel = true }: ThemeToggleProps) {
  const { mode, toggle } = useThemeStore()
  const colors = themes[mode]
  const isDark = mode === 'dark'

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.icon, { color: colors.text }]}>
            {isDark ? '🌙' : '☀️'}
          </Text>
          <Text style={[styles.label, { color: colors.text }]}>
            {isDark ? 'Modo Escuro' : 'Modo Claro'}
          </Text>
        </View>
      )}
      <Switch
        value={isDark}
        onValueChange={toggle}
        trackColor={{ false: '#E4E4E7', true: '#22C55E' }}
        thumbColor={isDark ? '#FAFAFA' : '#FAFAFA'}
        ios_backgroundColor="#E4E4E7"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
  },
})
