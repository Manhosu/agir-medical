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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  CreditCard,
  Crown,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

interface Subscription {
  id: string
  status: string
  plan: string
  starts_at: string
  expires_at: string
}

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  subscriptions?: Subscription[]
}

interface RecentActivation {
  id: string
  user_id: string
  plan: string
  paid_at: string
  gateway: string
  profiles?: {
    email: string
    full_name: string | null
  } | null
}

export default function AdminSubscriptionsPage() {
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResult, setSearchResult] = useState<Profile | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [recentActivations, setRecentActivations] = useState<RecentActivation[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(true)
  const [isActivating, setIsActivating] = useState(false)

  useEffect(() => {
    loadRecentActivations()
  }, [])

  const loadRecentActivations = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select(`
          id,
          user_id,
          plan,
          paid_at,
          gateway,
          profiles:user_id (email, full_name)
        `)
        .order('paid_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Normalizar dados (profiles pode vir como array ou objeto)
      const normalized = (data || []).map((item: any) => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      }))

      setRecentActivations(normalized)
    } catch (error) {
      console.error('Error loading recent activations:', error)
    } finally {
      setIsLoadingRecent(false)
    }
  }

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('Digite um email para buscar')
      return
    }

    setIsSearching(true)
    setNotFound(false)
    setSearchResult(null)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          subscriptions (id, status, plan, starts_at, expires_at)
        `)
        .ilike('email', searchEmail.trim())
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true)
        } else {
          throw error
        }
      } else {
        setSearchResult(data)
      }
    } catch (error) {
      console.error('Error searching user:', error)
      toast.error('Erro ao buscar usuario')
    } finally {
      setIsSearching(false)
    }
  }

  const activateSubscription = async (plan: 'standard' | 'premium') => {
    if (!searchResult) return

    setIsActivating(true)

    try {
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 12 meses

      // Cancelar assinatura anterior se existir
      const existingSub = searchResult.subscriptions?.[0]
      if (existingSub) {
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('id', existingSub.id)
      }

      // Criar nova assinatura
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: searchResult.id,
          status: 'active',
          plan: plan,
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_gateway: 'manual_admin'
        })

      if (subError) throw subError

      // Registrar no historico
      const { error: histError } = await supabase
        .from('payment_history')
        .insert({
          user_id: searchResult.id,
          gateway: 'manual_admin',
          plan: plan,
          amount: plan === 'premium' ? 95880 : 59880,
          status: 'completed',
          paid_at: now.toISOString(),
          metadata: { activated_by: 'admin', method: 'manual' }
        })

      if (histError) {
        console.warn('Error recording payment history:', histError)
      }

      toast.success(`Plano ${plan.toUpperCase()} ativado com sucesso!`)

      // Recarregar dados
      searchUser()
      loadRecentActivations()

    } catch (error) {
      console.error('Error activating subscription:', error)
      toast.error('Erro ao ativar assinatura')
    } finally {
      setIsActivating(false)
    }
  }

  const getSubscriptionStatus = (profile: Profile) => {
    const sub = profile.subscriptions?.[0]
    if (!sub) return { status: 'none', label: 'Sem assinatura', color: 'text-amber-500' }

    const now = new Date()
    const expires = new Date(sub.expires_at)

    if (sub.status === 'active' && expires > now) {
      return {
        status: 'active',
        label: `${sub.plan.toUpperCase()} ativo`,
        expires: expires,
        color: 'text-green-500'
      }
    } else if (sub.status === 'active' && expires <= now) {
      return { status: 'expired', label: 'Expirado', expires: expires, color: 'text-red-500' }
    } else {
      return { status: sub.status, label: sub.status, color: 'text-gray-500' }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Gerenciar Assinaturas</h1>
        <p className="text-muted-foreground">
          Ative assinaturas de alunos apos confirmar o pagamento
        </p>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Usuario
          </CardTitle>
          <CardDescription>
            Digite o email do aluno que realizou o pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="email@exemplo.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                className="pr-10"
              />
            </div>
            <Button onClick={searchUser} disabled={isSearching}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {/* Resultado da busca */}
          {notFound && (
            <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-500">
                <XCircle className="w-5 h-5" />
                <span>Nenhum usuario encontrado com esse email</span>
              </div>
            </div>
          )}

          {searchResult && (
            <div className="mt-4 p-4 rounded-lg glass border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={searchResult.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {searchResult.full_name
                        ? searchResult.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : searchResult.email.charAt(0).toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {searchResult.full_name || 'Sem nome'}
                    </p>
                    <p className="text-sm text-muted-foreground">{searchResult.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  {(() => {
                    const status = getSubscriptionStatus(searchResult)
                    return (
                      <div>
                        <span className={`font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        {status.expires && (
                          <p className="text-xs text-muted-foreground">
                            {status.status === 'active' ? 'Expira' : 'Expirou'}: {formatDate(status.expires.toISOString())}
                          </p>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Botoes de ativacao */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Ativar assinatura (12 meses):</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => activateSubscription('standard')}
                    disabled={isActivating}
                    className="flex-1"
                    variant="outline"
                  >
                    <Zap className="w-4 h-4 mr-2 text-primary" />
                    Ativar STANDARD
                  </Button>
                  <Button
                    onClick={() => activateSubscription('premium')}
                    disabled={isActivating}
                    className="flex-1 bg-[hsl(45,93%,58%)] hover:bg-[hsl(45,93%,48%)] text-black"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Ativar PREMIUM
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ativacoes recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Ativacoes Recentes
          </CardTitle>
          <CardDescription>
            Ultimas 10 assinaturas ativadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRecent ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentActivations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhuma ativacao registrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivations.map((activation) => (
                  <TableRow key={activation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {(activation.profiles as any)?.full_name || 'Sem nome'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(activation.profiles as any)?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        activation.plan === 'premium'
                          ? 'bg-[hsl(45,93%,58%)]/20 text-[hsl(45,93%,48%)]'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {activation.plan === 'premium' ? (
                          <Crown className="w-3 h-3" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        {activation.plan.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {activation.gateway === 'manual_admin' ? 'Manual (Admin)' : activation.gateway}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatDate(activation.paid_at)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
