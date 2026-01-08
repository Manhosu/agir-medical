import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header simples */}
      <header className="border-b border-border bg-card py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-2xl font-bold text-primary font-serif">
            AGIR
          </Link>
        </div>
      </header>

      {/* Conteúdo centralizado */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer simples */}
      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 AGIR - E-Learning Médico</p>
      </footer>
    </div>
  )
}
