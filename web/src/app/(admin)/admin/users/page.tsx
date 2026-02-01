'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
  UserCheck,
  UserX,
  Eye,
  Mail,
  Shield,
  ShieldOff,
  Calendar,
  CalendarPlus,
  CreditCard,
  RefreshCw
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
  subscription_status?: string
  subscription?: Subscription | null
}

// Hook de debounce
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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    loadUsers()
  }, [page])

  useEffect(() => {
    if (debouncedSearch) {
      const filtered = users.filter(user =>
        user.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.cpf?.includes(debouncedSearch) ||
        user.crm?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [debouncedSearch, users])

  const loadUsers = async () => {
    try {
      // Buscar total para paginacao
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      setTotalCount(count || 0)

      // Carregar perfis com dados completos de assinatura
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          subscriptions (id, status, plan, starts_at, expires_at)
        `)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (error) throw error

      const now = new Date()
      const usersWithSubscription = profiles.map((profile: any) => {
        const subscription = profile.subscriptions?.[0] || null
        let realStatus = 'none'

        if (subscription) {
          const expiresAt = new Date(subscription.expires_at)
          if (subscription.status === 'active' && expiresAt > now) {
            realStatus = 'active'
          } else if (subscription.status === 'active' && expiresAt <= now) {
            realStatus = 'expired' // Status é active mas expirou
          } else {
            realStatus = subscription.status
          }
        }

        return {
          ...profile,
          subscription_status: realStatus,
          subscription
        }
      })

      setUsers(usersWithSubscription)
      setFilteredUsers(usersWithSubscription)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin'

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ))

      toast.success(`Usuário ${newRole === 'admin' ? 'promovido a admin' : 'removido de admin'}`)
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Erro ao atualizar permissão')
    }
  }

  const activateSubscription = async (userId: string, months: number = 12) => {
    try {
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setMonth(expiresAt.getMonth() + months)

      // Verificar se já tem assinatura
      const user = users.find(u => u.id === userId)

      if (user?.subscription?.id) {
        // Atualizar assinatura existente
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            starts_at: now.toISOString(),
            expires_at: expiresAt.toISOString()
          })
          .eq('id', user.subscription.id)

        if (error) throw error
      } else {
        // Criar nova assinatura
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            status: 'active',
            plan: months === 12 ? 'annual' : 'semestral',
            starts_at: now.toISOString(),
            expires_at: expiresAt.toISOString()
          })

        if (error) throw error
      }

      toast.success(`Assinatura ativada por ${months} meses!`)
      loadUsers() // Recarregar lista
    } catch (error) {
      console.error('Error activating subscription:', error)
      toast.error('Erro ao ativar assinatura')
    }
  }

  const extendSubscription = async (userId: string, months: number = 12) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user?.subscription?.id) {
        toast.error('Usuário não possui assinatura')
        return
      }

      // Estender a partir da data de expiração atual ou de agora (o que for maior)
      const currentExpires = new Date(user.subscription.expires_at)
      const now = new Date()
      const baseDate = currentExpires > now ? currentExpires : now
      const newExpiresAt = new Date(baseDate)
      newExpiresAt.setMonth(newExpiresAt.getMonth() + months)

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          expires_at: newExpiresAt.toISOString()
        })
        .eq('id', user.subscription.id)

      if (error) throw error

      toast.success(`Assinatura estendida por ${months} meses!`)
      loadUsers()
    } catch (error) {
      console.error('Error extending subscription:', error)
      toast.error('Erro ao estender assinatura')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPlanDisplayName = (plan: string) => {
    const planNames: Record<string, string> = {
      'standard': 'STANDARD',
      'premium': 'PREMIUM',
      'annual': 'STANDARD',
      'semestral': 'STANDARD',
    }
    return planNames[plan?.toLowerCase()] || plan?.toUpperCase() || 'STANDARD'
  }

  const getSubscriptionBadge = (status: string, subscription?: Subscription | null) => {
    const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null
    const expiresFormatted = expiresAt ? expiresAt.toLocaleDateString('pt-BR') : ''
    const planName = subscription?.plan ? getPlanDisplayName(subscription.plan) : ''
    const isPremium = planName === 'PREMIUM'

    switch (status) {
      case 'active':
        return (
          <div className="space-y-1">
            <span className={`px-2 py-1 text-xs rounded-full ${
              isPremium
                ? 'bg-[hsl(45,93%,58%)]/20 text-[hsl(45,93%,48%)]'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            }`}>
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
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Expirado</span>
            {expiresFormatted && (
              <p className="text-xs text-muted-foreground">Expirou: {expiresFormatted}</p>
            )}
          </div>
        )
      case 'canceled':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Cancelado</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Sem assinatura</span>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários da plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-sm text-muted-foreground">Total de usuários</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {users.filter(u => u.subscription_status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Assinantes ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {users.filter(u => {
                const date = new Date(u.created_at)
                const now = new Date()
                const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
                return diffDays <= 7
              }).length}
            </div>
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
                {filteredUsers.length} usuário(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Assinatura</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
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
                        <div>
                          <p className="font-medium">{user.full_name || 'Sem nome'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSubscriptionBadge(user.subscription_status || 'none', user.subscription)}
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Shield className="h-4 w-4 text-primary" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Usuário</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Assinatura</DropdownMenuLabel>
                          {user.subscription_status !== 'active' && (
                            <>
                              <DropdownMenuItem onClick={() => activateSubscription(user.id, 12)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Ativar 12 meses
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => activateSubscription(user.id, 6)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Ativar 6 meses
                              </DropdownMenuItem>
                            </>
                          )}
                          {user.subscription && (
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
                          <DropdownMenuItem
                            onClick={() => toggleAdminRole(user.id, user.role)}
                          >
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
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalCount > PAGE_SIZE && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {totalCount > 0
                  ? `${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalCount)} de ${totalCount}`
                  : 'Nenhum resultado'}
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
