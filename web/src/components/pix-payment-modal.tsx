'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check, QrCode, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const PIX_KEY = '64469776000138'

interface PixPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: 'standard' | 'premium'
  userId?: string
  userEmail?: string
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function PixPaymentModal({
  open,
  onOpenChange,
  plan,
  userId,
  userEmail,
}: PixPaymentModalProps) {
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const planLabel = plan === 'premium' ? 'PREMIUM' : 'STANDARD'
  const planPrice = plan === 'premium' ? 'R$ 958,80' : 'R$ 598,80'

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopied(true)
      toast.success('Chave PIX copiada!')
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error('Erro ao copiar. Copie manualmente: ' + PIX_KEY)
    }
  }

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast.error('Preencha seu nome completo')
      return
    }
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      toast.error('CPF invalido. Digite os 11 digitos')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/pix-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          cpf: cleanCpf,
          email: userEmail || null,
          plan,
          user_id: userId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao registrar')
      }

      setSubmitted(true)
      toast.success('Pagamento registrado! Aguarde a confirmacao.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao registrar pagamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setFullName('')
      setCpf('')
      setCopied(false)
      setSubmitted(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Pagamento via PIX
          </DialogTitle>
          <DialogDescription>
            Plano {planLabel} - {planPrice} (12 meses)
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pagamento registrado!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Apos realizar o PIX, sua assinatura sera ativada em ate 24 horas uteis.
                Voce recebera uma notificacao quando o acesso for liberado.
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="w-full">
              Entendi
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Chave PIX */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
              <p className="text-sm font-medium text-center">Chave PIX (CNPJ)</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background rounded-lg px-3 py-2.5 text-center font-mono text-sm tracking-wider border">
                  {PIX_KEY}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPix}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Valor: <span className="font-semibold text-foreground">{planPrice}</span>
              </p>
            </div>

            {/* Aviso */}
            <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-500">
                Preencha seus dados abaixo para que possamos identificar seu pagamento e liberar o acesso.
              </p>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pix-name">Nome completo</Label>
                <Input
                  id="pix-name"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix-cpf">CPF</Label>
                <Input
                  id="pix-cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  inputMode="numeric"
                  maxLength={14}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar dados e pagar com PIX'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Apos o pagamento, seu acesso sera liberado em ate 24h uteis
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
