'use client'

import * as pdfjsLib from 'pdfjs-dist'

// Configurar worker do PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

interface ConvertedPage {
  pageNumber: number
  html: string
  textContent: string
}

interface ConversionResult {
  pages: ConvertedPage[]
  totalPages: number
  fullHtml: string
}

/**
 * Converte um arquivo PDF para HTML
 * Extrai o texto de cada página e formata como HTML
 */
export async function convertPdfToHtml(file: File): Promise<ConversionResult> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages: ConvertedPage[] = []
  let fullHtml = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    // Extrair texto com informações de posição
    const items = textContent.items as any[]

    // Agrupar por linhas baseado na posição Y
    const lines: Map<number, string[]> = new Map()

    items.forEach((item) => {
      if (item.str) {
        const y = Math.round(item.transform[5]) // posição Y arredondada
        if (!lines.has(y)) {
          lines.set(y, [])
        }
        lines.get(y)!.push(item.str)
      }
    })

    // Ordenar linhas por Y (de cima para baixo - Y maior primeiro)
    const sortedLines = Array.from(lines.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([_, texts]) => texts.join(' '))

    // Converter para HTML com parágrafos
    const pageText = sortedLines.join('\n')
    const pageHtml = sortedLines
      .filter(line => line.trim())
      .map(line => {
        // Detectar se é título (linha curta, potencialmente em maiúsculas)
        const isTitle = line.length < 100 && line === line.toUpperCase() && line.length > 3
        if (isTitle) {
          return `<h2 class="text-xl font-bold mt-6 mb-3">${escapeHtml(line)}</h2>`
        }
        return `<p class="mb-4 text-justify leading-relaxed">${escapeHtml(line)}</p>`
      })
      .join('\n')

    pages.push({
      pageNumber: i,
      html: pageHtml,
      textContent: pageText
    })

    // Adicionar separador de página
    if (i > 1) {
      fullHtml += `<hr class="my-8 border-border" />\n`
    }
    fullHtml += `<section class="page-${i}">\n${pageHtml}\n</section>\n`
  }

  return {
    pages,
    totalPages: pdf.numPages,
    fullHtml: wrapInArticle(fullHtml)
  }
}

/**
 * Escapa caracteres HTML
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Envolve o conteúdo em uma tag article com estilos
 */
function wrapInArticle(content: string): string {
  return `<article class="prose prose-lg dark:prose-invert max-w-none">
${content}
</article>`
}

/**
 * Estima o tempo de leitura baseado no número de palavras
 */
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200 // Média de leitura
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.ceil(words / wordsPerMinute)
}
