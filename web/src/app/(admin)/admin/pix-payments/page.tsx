'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Zap,
  Eye,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface PixPayment {
  id: string
  full_name: string
  cpf: string
  email: string | null
  plan: string
  amount: number
  status: string
  created_at: string
  approved_at: string | null
  notes: string | null
  user_id: string | null
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminPixPaymentsPage() {
  const [payments, setPayments] = useState<PixPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('pending')
  const [selectedPayment, setSelectedPayment] = useState<PixPayment | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    loadPayments()
  }, [filter])

  const loadPayments = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/pix-payments?status=${filter}`)
      if (!res.ok) throw new Error('Erro ao carregar')
      const data = await res.json()
      setPayments(data.payments || [])
      setPendingCount(data.pendingCount || 0)
    } catch (error) {
      console.error('Erro ao carregar pagamentos PIX:', error)
      toast.error('Erro ao carregar pagamentos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (payment: PixPayment) => {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/admin/pix-payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: payment.id, action: 'approve' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao aprovar')
      }

      const result = await res.json()

      if (result.subscription_created) {
        toast.success(`Pagamento aprovado e assinatura ${payment.plan.toUpperCase()} ativada!`)
      } else {
        toast.success('Pagamento aprovado! Usuario nao vinculado - ative a assinatura manualmente.')
      }

      setSelectedPayment(null)
      loadPayments()
    } catch (error) {
      console.error('Erro ao aprovar pagamento:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao aprovar pagamento')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (payment: PixPayment) => {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/admin/pix-payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: payment.id, action: 'reject' }),
      })

      if (!res.ok) throw new Error('Erro ao rejeitar')

      toast.success('Pagamento rejeitado')
      setSelectedPayment(null)
      loadPayments()
    } catch (error) {
      console.error('Erro ao rejeitar pagamento:', error)
      toast.error('Erro ao rejeitar pagamento')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCpf = (cpf: string) => {
    if (cpf.length !== 11) return cpf
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <QrCode className="w-8 h-8 text-primary" />
          Pagamentos PIX
        </h1>
        <p className="text-muted-foreground">
          Gerencie os pagamentos realizados via PIX manual
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as FilterStatus[]).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className="relative"
          >
            {status === 'pending' && 'Pendentes'}
            {status === 'approved' && 'Aprovados'}
            {status === 'rejected' && 'Rejeitados'}
            {status === 'all' && 'Todos'}
            {status === 'pending' && filter !== 'pending' && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'pending' ? 'Pagamentos Pendentes' :
             filter === 'approved' ? 'Pagamentos Aprovados' :
             filter === 'rejected' ? 'Pagamentos Rejeitados' :
             'Todos os Pagamentos'}
          </CardTitle>
          <CardDescription>
            {filter === 'pending'
              ? 'Compare os dados abaixo com os PIX recebidos para aprovar'
              : `Mostrando ${payments.length} pagamentos`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum pagamento {filter !== 'all' ? `com status "${filter}"` : ''} encontrado
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / CPF</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.full_name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {formatCpf(payment.cpf)}
                          </p>
                          {payment.email && (
                            <p className="text-xs text-muted-foreground">{payment.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          payment.plan === 'premium'
                            ? 'bg-[hsl(45,93%,58%)]/20 text-[hsl(45,93%,48%)]'
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {payment.plan === 'premium' ? (
                            <Crown className="w-3 h-3" />
                          ) : (
                            <Zap className="w-3 h-3" />
                          )}
                          {payment.plan.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {statusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento PIX</DialogTitle>
            <DialogDescription>
              Verifique os dados e compare com o PIX recebido
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nome completo</p>
                  <p className="font-medium">{selectedPayment.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPF</p>
                  <p className="font-mono font-medium">{formatCpf(selectedPayment.cpf)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedPayment.email || 'Nao informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plano</p>
                  <p className="font-medium">{selectedPayment.plan.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor esperado</p>
                  <p className="font-medium text-primary">{formatAmount(selectedPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data da solicitacao</p>
                  <p className="text-sm">{formatDate(selectedPayment.created_at)}</p>
                </div>
              </div>

              <div className="pt-2">
                {statusBadge(selectedPayment.status)}
                {selectedPayment.approved_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Aprovado em {formatDate(selectedPayment.approved_at)}
                  </p>
                )}
              </div>

              {selectedPayment.status === 'pending' && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedPayment)}
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedPayment)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Aprovar e Ativar
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
