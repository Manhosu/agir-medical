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

// Cores do tema - Dark Futuristic Medical Tech
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

    // Primary - Cyan/Teal (medical tech feel)
    primary: '#1ae8cc',         // Primary (175 80% 50%)
    primaryForeground: '#0d1117',
    primaryMuted: '#1ae8cc20',  // Primary with opacity

    // Accent - Emerald green
    accent: '#22c55e',          // Accent (160 70% 45%)
    accentForeground: '#0d1117',

    // Secondary - Deep blue
    secondary: '#1a365d',       // Secondary (220 60% 20%)
    secondaryForeground: '#e6edf3',

    // Destructive/Error
    destructive: '#dc2626',     // Destructive (0 70% 55%)
    error: '#dc2626',

    // Glow effects (for reference)
    glowPrimary: '#1ae8cc',
    glowAccent: '#22c55e',
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
    primary: '#1ae8cc',
    primaryForeground: '#0d1117',
    primaryMuted: '#1ae8cc20',
    accent: '#22c55e',
    accentForeground: '#0d1117',
    secondary: '#1a365d',
    secondaryForeground: '#e6edf3',
    destructive: '#dc2626',
    error: '#dc2626',
    glowPrimary: '#1ae8cc',
    glowAccent: '#22c55e',
  },
}

export type ThemeColors = typeof themes.dark
