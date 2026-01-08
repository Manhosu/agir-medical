import { useThemeStore, themes } from '../stores/themeStore'

/**
 * Hook simplificado para acessar as cores do tema atual
 * Uso: const colors = useTheme()
 */
export function useTheme() {
  const { mode } = useThemeStore()
  return themes[mode]
}

/**
 * Hook para acessar modo e cores juntos
 */
export function useThemeMode() {
  const { mode, toggle, setMode } = useThemeStore()
  const colors = themes[mode]
  return { mode, colors, toggle, setMode, isDark: mode === 'dark' }
}
