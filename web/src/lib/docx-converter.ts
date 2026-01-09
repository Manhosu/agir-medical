'use client'

import mammoth from 'mammoth'

interface ConversionResult {
  html: string
  messages: string[]
  wordCount: number
  estimatedReadingTime: number
}

/**
 * Converte um arquivo DOCX para HTML protegido
 * Usa mammoth.js para extrair o conteúdo e formata com estilos
 */
export async function convertDocxToHtml(file: File): Promise<ConversionResult> {
  const arrayBuffer = await file.arrayBuffer()

  // Opções de conversão do mammoth
  const options = {
    styleMap: [
      // Mapear estilos do Word para classes CSS
      "p[style-name='Heading 1'] => h1.text-2xl.font-bold.mt-8.mb-4",
      "p[style-name='Heading 2'] => h2.text-xl.font-bold.mt-6.mb-3",
      "p[style-name='Heading 3'] => h3.text-lg.font-semibold.mt-4.mb-2",
      "p[style-name='Title'] => h1.text-3xl.font-bold.mb-6",
      "b => strong",
      "i => em",
      "u => u.underline",
    ],
  }

  const result = await mammoth.convertToHtml({ arrayBuffer }, options)

  // Processar o HTML para melhorar a formatação
  let html = result.value

  // Adicionar classes de estilo aos parágrafos
  html = html.replace(/<p>/g, '<p class="mb-4 text-justify leading-relaxed">')

  // Melhorar formatação de listas
  html = html.replace(/<ul>/g, '<ul class="list-disc pl-6 mb-4 space-y-2">')
  html = html.replace(/<ol>/g, '<ol class="list-decimal pl-6 mb-4 space-y-2">')
  html = html.replace(/<li>/g, '<li class="text-justify">')

  // Melhorar formatação de tabelas
  html = html.replace(/<table>/g, '<table class="w-full border-collapse mb-6">')
  html = html.replace(/<tr>/g, '<tr class="border-b border-border">')
  html = html.replace(/<td>/g, '<td class="p-3 text-left">')
  html = html.replace(/<th>/g, '<th class="p-3 text-left font-semibold bg-muted">')

  // Detectar e formatar títulos em maiúsculas
  html = html.replace(
    /<p class="mb-4 text-justify leading-relaxed">([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s\-–]{5,})<\/p>/g,
    (match, content) => {
      // Se o texto é todo em maiúsculas e tem mais de 5 caracteres, é provavelmente um título
      if (content === content.toUpperCase() && content.trim().length > 5) {
        return `<h2 class="text-xl font-bold mt-6 mb-3">${content}</h2>`
      }
      return match
    }
  )

  // Contar palavras
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = textContent.split(' ').filter(Boolean).length

  // Estimar tempo de leitura (200 palavras por minuto)
  const estimatedReadingTime = Math.ceil(wordCount / 200)

  // Envolver em article com estilos
  const wrappedHtml = wrapInProtectedArticle(html)

  return {
    html: wrappedHtml,
    messages: result.messages.map(m => m.message),
    wordCount,
    estimatedReadingTime,
  }
}

/**
 * Envolve o conteúdo em uma estrutura protegida contra cópia
 */
function wrapInProtectedArticle(content: string): string {
  return `<article class="prose prose-lg dark:prose-invert max-w-none select-none" style="user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;">
${content}
</article>`
}

/**
 * Verifica se o arquivo é um DOCX válido
 */
export function isValidDocx(file: File): boolean {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/docx',
  ]
  return validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.docx')
}

/**
 * Verifica se o arquivo é um PDF válido
 */
export function isValidPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/**
 * Detecta o tipo do arquivo e retorna o conversor apropriado
 */
export function getFileType(file: File): 'docx' | 'pdf' | 'unknown' {
  if (isValidDocx(file)) return 'docx'
  if (isValidPdf(file)) return 'pdf'
  return 'unknown'
}
