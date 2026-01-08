'use client'

import { useEffect, useState, useMemo } from 'react'

interface DynamicWatermarkProps {
  userEmail: string
  className?: string
  density?: 'low' | 'medium' | 'high'
}

export function DynamicWatermark({
  userEmail,
  className = '',
  density = 'high'
}: DynamicWatermarkProps) {
  const [timestamp, setTimestamp] = useState('')
  const [sessionId, setSessionId] = useState('')

  // Gerar timestamp formatado
  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date()
      const formatted = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setTimestamp(formatted)
    }

    // Gerar ID de sessão único
    setSessionId(Math.random().toString(36).substring(2, 8).toUpperCase())

    updateTimestamp()
    // Atualizar a cada 30 segundos para maior precisão
    const interval = setInterval(updateTimestamp, 30000)

    return () => clearInterval(interval)
  }, [])

  // Texto da watermark com informações de rastreamento
  const watermarkText = useMemo(() => {
    if (!timestamp) return ''
    return `${userEmail} | ${timestamp} | ID:${sessionId}`
  }, [userEmail, timestamp, sessionId])

  // Gerar grid de watermarks baseado na densidade
  const watermarkCount = useMemo(() => {
    switch (density) {
      case 'low': return 20
      case 'medium': return 40
      case 'high': return 60
      default: return 60
    }
  }, [density])

  // Gerar posições aleatórias mas consistentes para as watermarks
  const watermarkPositions = useMemo(() => {
    const positions = []
    const rows = Math.ceil(Math.sqrt(watermarkCount))
    const cols = Math.ceil(watermarkCount / rows)

    for (let i = 0; i < watermarkCount; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols

      // Adicionar variação para parecer mais natural
      const baseX = (col / cols) * 100
      const baseY = (row / rows) * 100
      const offsetX = (Math.sin(i * 0.7) * 5)
      const offsetY = (Math.cos(i * 0.5) * 5)

      positions.push({
        left: `${Math.max(0, Math.min(95, baseX + offsetX))}%`,
        top: `${Math.max(0, Math.min(95, baseY + offsetY))}%`,
        opacity: 0.03 + (Math.sin(i) * 0.01), // Variação sutil de opacidade
        rotation: -30 + (Math.sin(i * 0.3) * 5), // Variação sutil de rotação
      })
    }
    return positions
  }, [watermarkCount])

  if (!watermarkText) return null

  return (
    <>
      {/* Camada principal de watermarks */}
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
        style={{ zIndex: 10000 }}
        aria-hidden="true"
      >
        {watermarkPositions.map((pos, index) => (
          <span
            key={index}
            className="absolute whitespace-nowrap font-mono text-foreground select-none"
            style={{
              left: pos.left,
              top: pos.top,
              fontSize: '11px',
              fontWeight: 500,
              opacity: pos.opacity,
              transform: `rotate(${pos.rotation}deg)`,
              letterSpacing: '0.5px',
              textShadow: '0 0 1px rgba(0,0,0,0.1)',
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {watermarkText}
          </span>
        ))}
      </div>

      {/* Camada extra para dificultar remoção por edição */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          zIndex: 10001,
          mixBlendMode: 'multiply',
        }}
        aria-hidden="true"
      >
        {/* Watermark central grande (mais visível) */}
        <div
          className="absolute font-mono text-foreground select-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
            fontSize: '16px',
            fontWeight: 600,
            opacity: 0.04,
            whiteSpace: 'nowrap',
            letterSpacing: '1px',
            pointerEvents: 'none',
          }}
        >
          {watermarkText}
        </div>

        {/* Watermarks nos cantos (difícil de cortar) */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner, idx) => (
          <div
            key={corner}
            className="absolute font-mono text-foreground select-none"
            style={{
              ...(corner.includes('top') ? { top: '5%' } : { bottom: '5%' }),
              ...(corner.includes('left') ? { left: '5%' } : { right: '5%' }),
              transform: `rotate(${-30 + (idx * 5)}deg)`,
              fontSize: '10px',
              fontWeight: 500,
              opacity: 0.035,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {userEmail}
          </div>
        ))}
      </div>

      {/* Camada invisível que aparece em screenshots (técnica CSS) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10002,
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 100px,
              rgba(128, 128, 128, 0.003) 100px,
              rgba(128, 128, 128, 0.003) 200px
            )
          `,
        }}
        aria-hidden="true"
      />
    </>
  )
}
