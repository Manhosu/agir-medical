'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { DynamicWatermark } from './DynamicWatermark'
import { useContentProtection } from './hooks/useContentProtection'
import { useDevToolsDetection } from './hooks/useDevToolsDetection'
import { toast } from 'sonner'

interface SecureContentViewerProps {
  children: React.ReactNode
  userEmail: string
  enabled?: boolean
  className?: string
}

export function SecureContentViewer({
  children,
  userEmail,
  enabled = true,
  className = ''
}: SecureContentViewerProps) {
  const [isBlurred, setIsBlurred] = useState(false)
  const [blurReason, setBlurReason] = useState<string>('')
  const [violationCount, setViolationCount] = useState(0)
  const [isWindowFocused, setIsWindowFocused] = useState(true)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Aplicar blur com motivo - INSTANTÂNEO
  const applyBlur = useCallback((reason: string, duration?: number) => {
    // Usar requestAnimationFrame para garantir blur antes do próximo frame
    requestAnimationFrame(() => {
      setIsBlurred(true)
      setBlurReason(reason)
    })

    // Também aplicar imediatamente para máxima velocidade
    setIsBlurred(true)
    setBlurReason(reason)

    if (duration) {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
      blurTimeoutRef.current = setTimeout(() => {
        setIsBlurred(false)
        setBlurReason('')
      }, duration)
    }
  }, [])

  // Remover blur
  const removeBlur = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
    setIsBlurred(false)
    setBlurReason('')
  }, [])

  // Função para aplicar blur instantâneo via DOM (mais rápido que state)
  const applyInstantBlur = useCallback(() => {
    if (containerRef.current) {
      const contentDiv = containerRef.current.querySelector('[data-content]') as HTMLElement
      if (contentDiv) {
        contentDiv.style.filter = 'blur(50px)'
        contentDiv.style.opacity = '0.3'
      }
    }
  }, [])

  // Hook de proteção de conteúdo
  useContentProtection({
    enabled,
    onViolation: (type) => {
      setViolationCount(prev => prev + 1)

      // Mostrar aviso ao usuário
      switch (type) {
        case 'print':
          toast.error('Impressao nao permitida', {
            description: 'Este conteudo e protegido contra impressao.'
          })
          applyBlur('Tentativa de impressao detectada', 3000)
          break
        case 'copy':
        case 'clipboard':
        case 'cut':
          toast.error('Copia nao permitida', {
            description: 'Este conteudo e protegido contra copia.'
          })
          break
        case 'screenshot':
          // BLUR INSTANTÂNEO via DOM para máxima velocidade
          applyInstantBlur()
          toast.error('Captura de tela detectada', {
            description: 'O conteudo foi protegido.'
          })
          applyBlur('Tentativa de screenshot detectada', 5000)
          break
        case 'devTools':
        case 'inspect':
        case 'console':
          toast.error('Ferramentas de desenvolvedor bloqueadas', {
            description: 'Feche o DevTools para continuar.'
          })
          break
        case 'contextMenu':
          toast.error('Menu de contexto desativado')
          break
        case 'selectAll':
          toast.error('Selecao nao permitida')
          break
        default:
          toast.error('Acao nao permitida')
      }

      // Se muitas violações, bloquear temporariamente
      if (violationCount > 3) {
        applyBlur('Muitas tentativas detectadas', 15000)
        toast.error('Muitas tentativas detectadas', {
          description: 'Conteudo bloqueado por 15 segundos.'
        })
        setViolationCount(0)
      }
    },
    onScreenshotAttempt: () => {
      // BLUR INSTANTÂNEO - primeiro via DOM, depois via state
      applyInstantBlur()
      applyBlur('Screenshot detectado', 5000)
    }
  })

  // Detectar DevTools
  const { isDevToolsOpen } = useDevToolsDetection({
    enabled,
    onDetected: () => {
      applyBlur('DevTools detectado')
      toast.error('DevTools detectado', {
        description: 'Feche as ferramentas de desenvolvedor para visualizar o conteudo.'
      })
    },
    onClosed: () => {
      if (isWindowFocused && isTabVisible) {
        removeBlur()
      }
    }
  })

  // ==========================================
  // PROTEÇÃO DE FOCO - Blur ao sair da janela/aba
  // ==========================================
  useEffect(() => {
    if (!enabled) return

    // Detectar quando aba perde visibilidade
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false)
        applyBlur('Aba em segundo plano')
      } else {
        setIsTabVisible(true)
        // Pequeno delay antes de remover blur (segurança extra)
        setTimeout(() => {
          if (!isDevToolsOpen && isWindowFocused) {
            removeBlur()
          }
        }, 500)
      }
    }

    // Detectar quando janela perde foco
    const handleWindowBlur = () => {
      setIsWindowFocused(false)
      applyBlur('Janela sem foco')
    }

    // Detectar quando janela ganha foco
    const handleWindowFocus = () => {
      setIsWindowFocused(true)
      // Pequeno delay antes de remover blur
      setTimeout(() => {
        if (!isDevToolsOpen && isTabVisible) {
          removeBlur()
        }
      }, 300)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [enabled, isDevToolsOpen, isWindowFocused, isTabVisible, applyBlur, removeBlur])

  // ==========================================
  // PROTEÇÃO EXTRA - Monitorar redimensionamento suspeito
  // ==========================================
  useEffect(() => {
    if (!enabled) return

    let lastWidth = window.innerWidth
    let lastHeight = window.innerHeight
    let resizeCount = 0

    const handleResize = () => {
      const widthDiff = Math.abs(window.innerWidth - lastWidth)
      const heightDiff = Math.abs(window.innerHeight - lastHeight)

      // Se redimensionamento muito grande e rápido, pode ser tentativa de esconder DevTools
      if (widthDiff > 100 || heightDiff > 100) {
        resizeCount++
        if (resizeCount > 3) {
          // Muitos redimensionamentos rápidos - suspeito
          resizeCount = 0
        }
      }

      lastWidth = window.innerWidth
      lastHeight = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [enabled])

  // Cleanup de timeout
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const shouldBlur = isBlurred || isDevToolsOpen || !isWindowFocused || !isTabVisible

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Conteúdo com blur condicional */}
      <div
        data-content="true"
        className={`transition-none ${
          shouldBlur ? 'blur-xl select-none pointer-events-none' : ''
        }`}
        style={{
          filter: shouldBlur ? 'blur(50px)' : 'none',
          opacity: shouldBlur ? 0.3 : 1,
          // Transição apenas na saída do blur, não na entrada (instantâneo)
          transition: shouldBlur ? 'none' : 'filter 0.5s ease-out, opacity 0.5s ease-out'
        }}
      >
        {children}
      </div>

      {/* Overlay de bloqueio */}
      {shouldBlur && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-md z-50">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-bold mb-3">Conteudo Protegido</h3>
            <p className="text-muted-foreground mb-4">
              {blurReason || (isDevToolsOpen
                ? 'Feche as ferramentas de desenvolvedor para continuar.'
                : !isWindowFocused
                  ? 'Clique na janela para continuar visualizando.'
                  : !isTabVisible
                    ? 'Volte para esta aba para continuar.'
                    : 'Aguarde alguns segundos...')}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Este conteudo e protegido por direitos autorais</span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay anti-screenshot (camada invisível que aparece em screenshots) */}
      <div
        className="absolute inset-0 pointer-events-none z-40"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.001) 10px, rgba(0,0,0,0.001) 20px)',
          mixBlendMode: 'difference',
        }}
        aria-hidden="true"
      />

      {/* Watermark dinâmica - mais visível */}
      <DynamicWatermark userEmail={userEmail} />
    </div>
  )
}
