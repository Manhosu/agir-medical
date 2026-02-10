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

// Cores do tema - A.G.I.R. Brand Green
export const themes = {
  dark: {
    // Background colors
    background: '#0d1117',      // Dark blue-black (220 30% 6%)
    card: '#151b24',            // Card background (220 25% 10%)
    surface: '#1a2332',         // Elevated surface (220 25% 12%)

    // Text colors
    text: '#e6edf3',            // Primary text (210 40% 96%)
    textSecondary: '#8b949e',   // Secondary text (215 20% 60%)
    textTertiary: '#6e7681',    // Tertiary text
    textMuted: '#6e7681',       // Muted text

    // Border & Input
    border: '#252d3a',          // Border (220 30% 18%)
    input: '#252d3a',           // Input background

    // Primary - Verde A.G.I.R.
    primary: '#02884a',         // Brand green (lighter for UI contrast)
    primaryForeground: '#ffffff',
    primaryMuted: '#02884a20',  // Primary with opacity

    // Accent - Verde escuro A.G.I.R.
    accent: '#103312',          // Dark green (#103312)
    accentForeground: '#ffffff',

    // Secondary - Deep blue
    secondary: '#1a365d',       // Secondary (220 60% 20%)
    secondaryForeground: '#e6edf3',

    // Destructive/Error
    destructive: '#dc2626',     // Destructive (0 70% 55%)
    error: '#dc2626',

    // Glow effects
    glowPrimary: '#02884a',
    glowAccent: '#103312',
  },
  light: {
    // Light mode (same as dark - app is always dark)
    background: '#0d1117',
    card: '#151b24',
    surface: '#1a2332',
    text: '#e6edf3',
    textSecondary: '#8b949e',
    textTertiary: '#6e7681',
    textMuted: '#6e7681',
    border: '#252d3a',
    input: '#252d3a',
    primary: '#02884a',
    primaryForeground: '#ffffff',
    primaryMuted: '#02884a20',
    accent: '#103312',
    accentForeground: '#ffffff',
    secondary: '#1a365d',
    secondaryForeground: '#e6edf3',
    destructive: '#dc2626',
    error: '#dc2626',
    glowPrimary: '#02884a',
    glowAccent: '#103312',
  },
}

export type ThemeColors = typeof themes.dark
