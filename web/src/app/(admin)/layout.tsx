'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  LogOut,
  Menu,
  ChevronRight,
  Home
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/courses', label: 'Cursos', icon: BookOpen },
  { href: '/admin/reports', label: 'Relatórios', icon: BarChart3 },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, isAdmin, isLoading, signOut } = useAuth()

  // Verificar se é admin - redireciona para dashboard se não for admin
  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      // Usuário logado mas não é admin - vai para dashboard normal
      window.location.href = '/dashboard'
    } else if (!isLoading && !user) {
      // Não está logado - vai para login
      window.location.href = '/login'
    }
  }, [isAdmin, isLoading, user])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'A'

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r bg-card">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <div>
              <span className="font-serif font-bold text-lg">AGIR</span>
              <span className="text-xs text-muted-foreground block">Painel Admin</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Voltar ao App</span>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6">
          {/* Mobile menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {adminNavItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Voltar ao App</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Admin</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">
                {adminNavItems.find(i => i.href === pathname)?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline font-medium">
                  {profile?.full_name || user?.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
