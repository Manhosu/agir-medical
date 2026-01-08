'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface UseDevToolsDetectionOptions {
  enabled?: boolean
  onDetected?: () => void
  onClosed?: () => void
}

export function useDevToolsDetection(options: UseDevToolsDetectionOptions = {}) {
  const { enabled = true, onDetected, onClosed } = options
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const wasOpenRef = useRef(false)

  const checkDevTools = useCallback(() => {
    // Metodo 1: Verificar diferenca entre outer e inner dimensions
    const widthThreshold = window.outerWidth - window.innerWidth > 160
    const heightThreshold = window.outerHeight - window.innerHeight > 160

    // Metodo 2: Verificar usando debugger timing (mais preciso mas invasivo)
    // Nao usado aqui para evitar afetar performance

    const detected = widthThreshold || heightThreshold

    if (detected && !wasOpenRef.current) {
      wasOpenRef.current = true
      setIsDevToolsOpen(true)
      onDetected?.()
      console.warn('[Security] DevTools detectado')
    } else if (!detected && wasOpenRef.current) {
      wasOpenRef.current = false
      setIsDevToolsOpen(false)
      onClosed?.()
    }

    return detected
  }, [onDetected, onClosed])

  useEffect(() => {
    if (!enabled) return

    // Verificacao inicial
    checkDevTools()

    // Verificar periodicamente
    checkIntervalRef.current = setInterval(checkDevTools, 1000)

    // Verificar ao redimensionar (mais responsivo)
    const handleResize = () => {
      checkDevTools()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [enabled, checkDevTools])

  return { isDevToolsOpen }
}
