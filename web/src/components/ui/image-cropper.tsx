'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from './button'
import { ZoomIn, ZoomOut, Move, Check, X } from 'lucide-react'

interface ImageCropperProps {
  imageSrc: string
  aspectRatio?: number // width / height (ex: 16/9 = 1.77)
  outputWidth?: number
  outputHeight?: number
  onCropComplete: (croppedFile: File) => void
  onCancel: () => void
}

export function ImageCropper({
  imageSrc,
  aspectRatio = 16 / 9,
  outputWidth = 800,
  outputHeight = 450,
  onCropComplete,
  onCancel
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 400, height: 225 })

  // Load image
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)

      // Calculate initial zoom to fit image
      const imgRatio = img.width / img.height
      if (imgRatio > aspectRatio) {
        // Image is wider - fit by height
        setZoom(1)
      } else {
        // Image is taller - fit by width
        setZoom(1)
      }
      setPosition({ x: 0, y: 0 })
    }
    img.src = imageSrc
  }, [imageSrc, aspectRatio])

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth, 600)
        const height = width / aspectRatio
        setContainerSize({ width, height })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [aspectRatio])

  // Draw image on canvas
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !imageLoaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = containerSize.width
    canvas.height = containerSize.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate scaled dimensions
    const imgRatio = img.width / img.height
    const canvasRatio = canvas.width / canvas.height

    let drawWidth, drawHeight

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas ratio - fit by height
      drawHeight = canvas.height * zoom
      drawWidth = drawHeight * imgRatio
    } else {
      // Image is taller than canvas ratio - fit by width
      drawWidth = canvas.width * zoom
      drawHeight = drawWidth / imgRatio
    }

    const x = (canvas.width - drawWidth) / 2 + position.x
    const y = (canvas.height - drawHeight) / 2 + position.y

    ctx.drawImage(img, x, y, drawWidth, drawHeight)
  }, [zoom, position, imageLoaded, containerSize])

  useEffect(() => {
    drawImage()
  }, [drawImage])

  // Mouse/Touch handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value))
  }

  // Generate cropped image
  const handleCrop = () => {
    const img = imageRef.current
    if (!img) return

    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = outputWidth
    outputCanvas.height = outputHeight

    const ctx = outputCanvas.getContext('2d')
    if (!ctx) return

    // Calculate the same transform as display but for output resolution
    const scale = outputWidth / containerSize.width
    const imgRatio = img.width / img.height
    const canvasRatio = containerSize.width / containerSize.height

    let drawWidth, drawHeight

    if (imgRatio > canvasRatio) {
      drawHeight = containerSize.height * zoom
      drawWidth = drawHeight * imgRatio
    } else {
      drawWidth = containerSize.width * zoom
      drawHeight = drawWidth / imgRatio
    }

    const x = ((containerSize.width - drawWidth) / 2 + position.x) * scale
    const y = ((containerSize.height - drawHeight) / 2 + position.y) * scale

    ctx.drawImage(img, x, y, drawWidth * scale, drawHeight * scale)

    outputCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        })
        onCropComplete(file)
      }
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Ajustar Imagem</h3>
          <p className="text-sm text-muted-foreground">
            Arraste para posicionar e use o zoom para ajustar
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Canvas Container */}
          <div
            ref={containerRef}
            className="relative mx-auto border-2 border-dashed border-primary/50 rounded-lg overflow-hidden bg-muted"
            style={{
              width: '100%',
              maxWidth: '600px',
              aspectRatio: `${aspectRatio}`
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            {/* Overlay guides */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-white/30" />
              {/* Rule of thirds */}
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
            </div>

            {/* Move indicator */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Move className="w-3 h-3" />
              Arraste
            </div>
          </div>

          {/* Zoom Control */}
          <div className="flex items-center gap-4 px-4">
            <ZoomOut className="w-5 h-5 text-muted-foreground" />
            <input
              type="range"
              value={zoom}
              onChange={handleZoomChange}
              min={0.5}
              max={3}
              step={0.1}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <ZoomIn className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Zoom percentage */}
          <div className="text-center text-sm text-muted-foreground">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleCrop}>
            <Check className="w-4 h-4 mr-2" />
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  )
}
