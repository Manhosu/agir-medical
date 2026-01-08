import { Platform, NativeModules } from 'react-native'

/**
 * Utilitário para proteção de conteúdo no app mobile
 * Implementa medidas de segurança para evitar captura de tela e gravação
 */

// Para implementação completa, seria necessário criar módulos nativos:
// Android: FLAG_SECURE
// iOS: UIApplication.shared.userInterfaceLayoutDirection

/**
 * Habilita proteção de tela (bloqueia screenshots e gravação)
 * Requer implementação de módulo nativo
 */
export function enableScreenProtection(): void {
  if (Platform.OS === 'android') {
    // Android: Usar FLAG_SECURE através de módulo nativo
    // NativeModules.ScreenProtection?.enable()
    console.log('[ContentProtection] Screen protection enabled for Android')
  } else if (Platform.OS === 'ios') {
    // iOS: Usar secureTextField ou similar
    // NativeModules.ScreenProtection?.enable()
    console.log('[ContentProtection] Screen protection enabled for iOS')
  }
}

/**
 * Desabilita proteção de tela
 * Requer implementação de módulo nativo
 */
export function disableScreenProtection(): void {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // NativeModules.ScreenProtection?.disable()
    console.log('[ContentProtection] Screen protection disabled')
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
