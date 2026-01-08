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
      opacity: 0.03;
      overflow: hidden;
    }
    .watermark::before {
      content: '${email}';
      position: absolute;
      white-space: nowrap;
      font-size: 12px;
      color: currentColor;
      transform: rotate(-30deg);
    }
  `
}

/**
 * Gera HTML de watermarks repetidos
 */
export function generateWatermarkHTML(email: string, count: number = 20): string {
  return Array.from({ length: count })
    .map(
      (_, i) =>
        `<div class="watermark-text" style="top: ${(i * 5) % 100}%; left: ${(i * 7) % 100}%;">${email}</div>`,
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
