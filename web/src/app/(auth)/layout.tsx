import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="font-display text-xl font-bold text-primary">A</span>
            </div>
            <span className="font-display font-bold text-foreground">A.G.I.R.</span>
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
