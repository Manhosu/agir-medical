'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseContentProtectionOptions {
  enabled?: boolean
  onViolation?: (type: string) => void
  onScreenshotAttempt?: () => void
}

export function useContentProtection(options: UseContentProtectionOptions = {}) {
  const { enabled = true, onViolation, onScreenshotAttempt } = options
  const lastKeyTime = useRef<number>(0)
  const isMetaPressed = useRef(false)
  const isShiftPressed = useRef(false)

  const handleViolation = useCallback((type: string) => {
    console.warn(`[Security] Tentativa bloqueada: ${type}`)
    onViolation?.(type)
  }, [onViolation])

  const handleScreenshotAttempt = useCallback(() => {
    console.warn('[Security] Tentativa de screenshot detectada')
    onScreenshotAttempt?.()
    handleViolation('screenshot')
  }, [onScreenshotAttempt, handleViolation])

  useEffect(() => {
    if (!enabled) return

    // ==========================================
    // PROTEÇÃO DE TECLADO (Atalhos)
    // ==========================================
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()

      // Rastrear teclas modificadoras para detecção proativa
      if (e.key === 'Meta' || e.key === 'OS') {
        isMetaPressed.current = true
      }
      if (e.key === 'Shift') {
        isShiftPressed.current = true
      }

      // DETECÇÃO PROATIVA: Win + Shift pressionados juntos = possível screenshot
      // Aplicar blur IMEDIATAMENTE antes que S seja pressionado
      if (isMetaPressed.current && isShiftPressed.current) {
        handleScreenshotAttempt()
        return false
      }

      // Detectar PrintScreen (key pode variar por sistema)
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault()
        e.stopPropagation()
        handleScreenshotAttempt()
        return false
      }

      // Windows Snipping Tool (Win + Shift + S)
      if (e.key.toLowerCase() === 's' && e.shiftKey && e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        handleScreenshotAttempt()
        return false
      }

      // Mac Screenshot (Cmd + Shift + 3/4/5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
        handleScreenshotAttempt()
        return false
      }

      // Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('print')
        return false
      }

      // Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('save')
        return false
      }

      // Ctrl/Cmd + C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('copy')
        return false
      }

      // Ctrl/Cmd + X (Cut)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('cut')
        return false
      }

      // Ctrl/Cmd + A (Select All)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('selectAll')
        return false
      }

      // Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('viewSource')
        return false
      }

      // Ctrl/Cmd + Shift + I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('devTools')
        return false
      }

      // Ctrl/Cmd + Shift + J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('console')
        return false
      }

      // Ctrl/Cmd + Shift + C (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('inspect')
        return false
      }

      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('devTools')
        return false
      }

      // Ctrl/Cmd + Shift + K (Firefox Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        e.stopPropagation()
        handleViolation('console')
        return false
      }

      // Alt + PrintScreen (Windows screenshot of active window)
      if (e.altKey && (e.key === 'PrintScreen' || e.code === 'PrintScreen')) {
        e.preventDefault()
        e.stopPropagation()
        handleScreenshotAttempt()
        return false
      }

      lastKeyTime.current = now
    }

    // Capturar no keyup para PrintScreen e resetar estados
    const handleKeyUp = (e: KeyboardEvent) => {
      // Resetar estados das teclas modificadoras
      if (e.key === 'Meta' || e.key === 'OS') {
        isMetaPressed.current = false
      }
      if (e.key === 'Shift') {
        isShiftPressed.current = false
      }

      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault()
        e.stopPropagation()
        handleScreenshotAttempt()
        return false
      }
    }

    // ==========================================
    // PROTEÇÃO DE MOUSE
    // ==========================================

    // Bloquear menu de contexto (clique direito)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleViolation('contextMenu')
      return false
    }

    // Bloquear seleção de texto
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Bloquear drag de elementos
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // ==========================================
    // PROTEÇÃO DE CLIPBOARD
    // ==========================================

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // Limpar clipboard
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '')
      }
      handleViolation('clipboard')
      return false
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleViolation('cut')
      return false
    }

    const handlePaste = (e: ClipboardEvent) => {
      // Permitir paste em campos de input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return true
      }
      e.preventDefault()
      return false
    }

    // ==========================================
    // PROTEÇÃO CONTRA SCREEN RECORDING
    // ==========================================

    // Detectar MediaDevices (pode indicar screen recording)
    const checkMediaDevices = async () => {
      try {
        if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
          // Apenas monitorar, não bloquear
        }
      } catch {
        // Ignorar erros
      }
    }

    // ==========================================
    // ADICIONAR EVENT LISTENERS
    // ==========================================

    // Usar capture: true para interceptar antes de qualquer outro handler
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    document.addEventListener('keyup', handleKeyUp, { capture: true })
    document.addEventListener('contextmenu', handleContextMenu, { capture: true })
    document.addEventListener('selectstart', handleSelectStart, { capture: true })
    document.addEventListener('dragstart', handleDragStart, { capture: true })
    document.addEventListener('copy', handleCopy, { capture: true })
    document.addEventListener('cut', handleCut, { capture: true })
    document.addEventListener('paste', handlePaste, { capture: true })

    // Verificar periodicamente
    const checkInterval = setInterval(checkMediaDevices, 5000)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
      document.removeEventListener('keyup', handleKeyUp, { capture: true })
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true })
      document.removeEventListener('selectstart', handleSelectStart, { capture: true })
      document.removeEventListener('dragstart', handleDragStart, { capture: true })
      document.removeEventListener('copy', handleCopy, { capture: true })
      document.removeEventListener('cut', handleCut, { capture: true })
      document.removeEventListener('paste', handlePaste, { capture: true })
      clearInterval(checkInterval)
    }
  }, [enabled, handleViolation, handleScreenshotAttempt])

  return { enabled }
}
