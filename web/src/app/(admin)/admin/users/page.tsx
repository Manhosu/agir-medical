'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  MoreVertical,
  Shield,
  ShieldOff,
  CalendarPlus,
  Zap,
  Crown,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface Subscription {
  id: string
  status: string
  plan: string
  starts_at: string
  expires_at: string
}

interface User {
  id: string
  email: string
  full_name: string | null
  cpf: string | null
  crm: string | null
  role: string
  avatar_url: string | null
  created_at: string
  subscriptions: Subscription[]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

const PAGE_SIZE = 20

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const debouncedSearch = useDebounce(searchQuery, 500)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  useEffect(() => {
    loadUsers()
  }, [page, debouncedSearch])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
      })
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Erro ao carregar')

      const data = await res.json()
      setUsers(data.users || [])
      setTotalCount(data.totalCount || 0)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Erro ao carregar usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const getActiveSubscription = (user: User): Subscription | null => {
    if (!user.subscriptions || user.subscriptions.length === 0) return null
    // Pegar a mais recente que esta ativa
    const active = user.subscriptions.find(s => s.status === 'active')
    return active || user.subscriptions[0]
  }

  const getSubscriptionStatus = (user: User): string => {
    const sub = getActiveSubscription(user)
    if (!sub) return 'none'
    const now = new Date()
    const expiresAt = new Date(sub.expires_at)
    if (sub.status === 'active' && expiresAt > now) return 'active'
    if (sub.status === 'active' && expiresAt <= now) return 'expired'
    return sub.status
  }

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_admin', userId, currentRole }),
      })
      if (!res.ok) throw new Error('Erro')
      const data = await res.json()

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: data.newRole } : u
      ))
      toast.success(`Usuario ${data.newRole === 'admin' ? 'promovido a admin' : 'removido de admin'}`)
    } catch (error) {
      toast.error('Erro ao atualizar permissao')
    }
  }

  const activateSubscription = async (userId: string, plan: 'standard' | 'premium', months: number = 12) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate_subscription', userId, plan, months }),
      })
      if (!res.ok) throw new Error('Erro')

      toast.success(`Assinatura ${plan.toUpperCase()} ativada por ${months} meses!`)
      loadUsers()
    } catch (error) {
      toast.error('Erro ao ativar assinatura')
    }
  }

  const extendSubscription = async (userId: string, months: number) => {
    const user = users.find(u => u.id === userId)
    const sub = getActiveSubscription(user!)
    if (!sub) {
      toast.error('Usuário não possui assinatura')
      return
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extend_subscription',
          userId,
          subscriptionId: sub.id,
          months,
          currentExpiresAt: sub.expires_at,
        }),
      })
      if (!res.ok) throw new Error('Erro')

      toast.success(`Assinatura estendida por ${months} meses!`)
      loadUsers()
    } catch (error) {
      toast.error('Erro ao estender assinatura')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getPlanName = (plan: string) => {
    if (!plan) return 'STANDARD'
    const p = plan.toLowerCase()
    if (p === 'premium') return 'PREMIUM'
    return 'STANDARD'
  }

  const getSubscriptionBadge = (user: User) => {
    const status = getSubscriptionStatus(user)
    const sub = getActiveSubscription(user)
    const planName = sub ? getPlanName(sub.plan) : ''
    const isPremium = planName === 'PREMIUM'
    const expiresFormatted = sub?.expires_at ? formatDate(sub.expires_at) : ''

    switch (status) {
      case 'active':
        return (
          <div className="space-y-1">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
              isPremium
                ? 'bg-[hsl(45,93%,58%)]/20 text-[hsl(45,93%,48%)]'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {isPremium ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              {planName}
            </span>
            {expiresFormatted && (
              <p className="text-xs text-muted-foreground">Expira: {expiresFormatted}</p>
            )}
          </div>
        )
      case 'expired':
        return (
          <div className="space-y-1">
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Expirado
            </span>
            {expiresFormatted && (
              <p className="text-xs text-muted-foreground">Expirou: {expiresFormatted}</p>
            )}
          </div>
        )
      case 'canceled':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Cancelado</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Sem assinatura</span>
    }
  }

  const activeCount = users.filter(u => getSubscriptionStatus(u) === 'active').length
  const adminCount = users.filter(u => u.role === 'admin').length
  const recentCount = users.filter(u => {
    const diffDays = Math.floor((Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuarios da plataforma
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-sm text-muted-foreground">Total de usuarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-sm text-muted-foreground">Assinantes ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{recentCount}</div>
            <p className="text-sm text-muted-foreground">Novos esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                {users.length} usuario(s) nesta pagina | {totalCount} total
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Assinatura</TableHead>
                    <TableHead className="hidden md:table-cell">Funcao</TableHead>
                    <TableHead className="hidden md:table-cell">Cadastro</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const subStatus = getSubscriptionStatus(user)
                    const sub = getActiveSubscription(user)

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {user.full_name
                                  ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                  : user.email.charAt(0).toUpperCase()
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{user.full_name || 'Sem nome'}</p>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                              {user.role === 'admin' && (
                                <span className="inline-flex items-center gap-1 text-xs text-primary md:hidden">
                                  <Shield className="h-3 w-3" /> Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSubscriptionBadge(user)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.role === 'admin' ? (
                            <span className="flex items-center gap-1 text-sm">
                              <Shield className="h-4 w-4 text-primary" />
                              Admin
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Usuario</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Assinatura</DropdownMenuLabel>
                              {subStatus !== 'active' && (
                                <>
                                  <DropdownMenuItem onClick={() => activateSubscription(user.id, 'standard', 12)}>
                                    <Zap className="mr-2 h-4 w-4 text-green-500" />
                                    Ativar STANDARD (12 meses)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => activateSubscription(user.id, 'premium', 12)}>
                                    <Crown className="mr-2 h-4 w-4 text-[hsl(45,93%,48%)]" />
                                    Ativar PREMIUM (12 meses)
                                  </DropdownMenuItem>
                                </>
                              )}
                              {sub && subStatus === 'active' && (
                                <>
                                  <DropdownMenuItem onClick={() => extendSubscription(user.id, 12)}>
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Estender +12 meses
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => extendSubscription(user.id, 6)}>
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Estender +6 meses
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => extendSubscription(user.id, 1)}>
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Estender +1 mes
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Permissao</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => toggleAdminRole(user.id, user.role)}>
                                {user.role === 'admin' ? (
                                  <>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Remover admin
                                  </>
                                ) : (
                                  <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Tornar admin
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum usuario encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalCount > PAGE_SIZE && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalCount)} de {totalCount}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page + 1) * PAGE_SIZE >= totalCount}
                  onClick={() => setPage(p => p + 1)}
                >
                  Proximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
