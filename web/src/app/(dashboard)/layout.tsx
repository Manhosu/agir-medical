'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { LogOut, LayoutDashboard, BookOpen, Crown, User, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Cursos', icon: BookOpen },
  { href: '/subscription', label: 'Assinatura', icon: Crown },
  { href: '/profile', label: 'Perfil', icon: User },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, isLoading, signOut, isAdmin } = useAuth()
  const [forceRender, setForceRender] = useState(false)
  const [localUser, setLocalUser] = useState<any>(null)

  // Verificar sessao diretamente se isLoading demorar muito
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (isLoading) {
        console.log('Dashboard layout: Loading timeout, checking session directly')
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setLocalUser(session.user)
          setForceRender(true)
        } else {
          window.location.href = '/login'
        }
      }
    }, 3000) // 3 segundos de timeout

    return () => clearTimeout(timeout)
  }, [isLoading])

  // Redirecionar para login se nao autenticado
  useEffect(() => {
    if (!isLoading && !user && !localUser) {
      window.location.href = '/login'
    }
  }, [isLoading, user, localUser])

  // Usar usuario do hook ou local
  const currentUser = user || localUser

  if (isLoading && !forceRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  // Mostrar loading enquanto redireciona
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar hidden md:block relative z-10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image
                src="/logo-circular-white.png"
                alt="A.G.I.R."
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              <span className="font-display font-bold text-foreground">A.G.I.R.</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground glow-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}

            {isAdmin && (
              <>
                <div className="py-2">
                  <div className="border-t border-sidebar-border" />
                </div>
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname.startsWith('/admin')
                      ? 'bg-primary text-primary-foreground glow-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Settings className="w-5 h-5" />
                  Painel Admin
                </Link>
              </>
            )}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8 border border-primary/30">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">{getInitials(profile?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left flex-1 min-w-0">
                <span className="text-sm font-medium truncate w-full">
                  {profile?.full_name || 'Usuario'}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full">
                  {currentUser?.email}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Mobile header */}
        <header className="md:hidden border-b border-border bg-card/80 backdrop-blur-lg p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo-circular-white.png"
              alt="A.G.I.R."
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
            <span className="font-display font-bold text-foreground">A.G.I.R.</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8 border border-primary/30">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials(profile?.full_name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{profile?.full_name || 'Usuario'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">Painel Admin</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
