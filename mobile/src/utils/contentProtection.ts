import { Platform } from 'react-native'
import * as ScreenCapture from 'expo-screen-capture'

/**
 * Utilitário para proteção de conteúdo no app mobile
 * Implementa medidas de segurança para evitar captura de tela e gravação
 * Usa expo-screen-capture para protecao nativa
 *
 * Nota: Em Expo Go a funcionalidade e limitada. Para protecao completa,
 * use um build de producao (EAS Build)
 */

/**
 * Habilita proteção de tela (bloqueia screenshots e gravação)
 * Android: Usa FLAG_SECURE
 * iOS: Limita gravacao de tela (screenshots podem ainda funcionar)
 */
export async function enableScreenProtection(): Promise<void> {
  try {
    await ScreenCapture.preventScreenCaptureAsync()
    console.log('[ContentProtection] Screen protection enabled')
  } catch (error) {
    // Em Expo Go, isso pode falhar - e esperado
    console.warn('[ContentProtection] Screen protection not available:', error)
  }
}

/**
 * Desabilita proteção de tela
 */
export async function disableScreenProtection(): Promise<void> {
  try {
    await ScreenCapture.allowScreenCaptureAsync()
    console.log('[ContentProtection] Screen protection disabled')
  } catch (error) {
    console.warn('[ContentProtection] Could not disable screen protection:', error)
  }
}

/**
 * Hook para monitorar tentativas de captura de tela
 * Retorna subscription que deve ser limpa no cleanup
 */
export function addScreenshotListener(
  callback: () => void
): ScreenCapture.Subscription | null {
  try {
    return ScreenCapture.addScreenshotListener(callback)
  } catch (error) {
    console.warn('[ContentProtection] Screenshot listener not available:', error)
    return null
  }
}

/**
 * Gera o CSS para watermark no conteúdo
 * Atualizado para maior visibilidade em temas claros e escuros
 */
export function generateWatermarkCSS(email: string): string {
  return `
    .watermark {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    }
    .watermark-text {
      position: absolute;
      white-space: nowrap;
      font-size: 11px;
      font-weight: 600;
      color: rgba(128, 128, 128, 0.45);
      text-shadow: 0 0 2px rgba(255,255,255,0.3), 0 0 2px rgba(0,0,0,0.3);
      transform: rotate(-30deg);
      opacity: 0.85;
    }
    .watermark-center {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 14px;
      font-weight: 700;
      color: rgba(128, 128, 128, 0.5);
      text-shadow: 0 0 3px rgba(255,255,255,0.4), 0 0 3px rgba(0,0,0,0.4);
      white-space: nowrap;
      pointer-events: none;
      z-index: 1001;
      opacity: 0.9;
    }
  `
}

/**
 * Gera HTML de watermarks repetidos
 * Aumentado para 30 watermarks para melhor cobertura
 */
export function generateWatermarkHTML(email: string, count: number = 30): string {
  return Array.from({ length: count })
    .map(
      (_, i) =>
        `<div class="watermark-text" style="top: ${(i * 3.5) % 100}%; left: ${(i * 5) % 100}%;">${email}</div>`,
    )
    .join('')
}

/**
 * Gera o JavaScript para bloquear interações no WebView
 */
export function getProtectionScript(): string {
  return `
    // Bloquear seleção de texto
    document.addEventListener('selectstart', function(e) {
      e.preventDefault();
    });

    // Bloquear menu de contexto
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });

    // Bloquear cópia
    document.addEventListener('copy', function(e) {
      e.preventDefault();
    });

    // Bloquear arrastar
    document.addEventListener('dragstart', function(e) {
      e.preventDefault();
    });

    // Bloquear atalhos de teclado (para tablets com teclado)
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'p' || e.key === 's')) {
        e.preventDefault();
      }
    });
  `
}
