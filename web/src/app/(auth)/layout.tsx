'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-64 md:w-80 h-40 sm:h-64 md:h-80 rounded-full bg-accent/10 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg py-4">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-horizontal-white.png"
              alt="A.G.I.R."
              width={160}
              height={45}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Conteudo centralizado */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-4 text-center text-sm text-muted-foreground bg-background/50 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} Programa A.G.I.R. - Formacao Medica</p>
      </footer>
    </div>
  )
}
