import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  isLoading: boolean
}

interface ThemeActions {
  initialize: () => Promise<void>
  setMode: (mode: ThemeMode) => Promise<void>
  toggle: () => Promise<void>
}

type ThemeStore = ThemeState & ThemeActions

const THEME_KEY = '@agir:theme'

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'dark',
  isLoading: true,

  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY)
      if (stored === 'light' || stored === 'dark') {
        set({ mode: stored, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Error loading theme:', error)
      set({ isLoading: false })
    }
  },

  setMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode)
      set({ mode })
    } catch (error) {
      console.error('Error saving theme:', error)
    }
  },

  toggle: async () => {
    const newMode = get().mode === 'dark' ? 'light' : 'dark'
    await get().setMode(newMode)
  },
}))

// Cores do tema
export const themes = {
  dark: {
    background: '#0A0A0B',
    card: '#18181B',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    border: '#27272A',
    primary: '#22C55E',
    primaryForeground: '#FAFAFA',
    destructive: '#EF4444',
    input: '#27272A',
  },
  light: {
    background: '#FFFFFF',
    card: '#F4F4F5',
    text: '#09090B',
    textSecondary: '#52525B',
    textMuted: '#71717A',
    border: '#E4E4E7',
    primary: '#16A34A',
    primaryForeground: '#FFFFFF',
    destructive: '#DC2626',
    input: '#E4E4E7',
  },
}

export type ThemeColors = typeof themes.dark
