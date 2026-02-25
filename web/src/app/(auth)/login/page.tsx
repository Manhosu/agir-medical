'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const { signOut, isLoading, user, isAdmin, sendOtp, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoggedInState, setShowLoggedInState] = useState(false)
  const otpInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && user) {
      setShowLoggedInState(true)
    }
  }, [isLoading, user])

  if (showLoggedInState && user) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif">Você já está logado</CardTitle>
          <CardDescription>
            Deseja continuar ou entrar com outra conta?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={() => {
              if (isAdmin) {
                window.location.href = '/admin'
              } else {
                window.location.href = '/dashboard'
              }
            }}
          >
            Continuar como {user.email}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await signOut()
              window.location.reload()
            }}
          >
            Entrar com outra conta
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Digite seu email')
      return
    }

    setIsSubmitting(true)

    try {
      await sendOtp(email.trim().toLowerCase())
      setStep('otp')
      toast.success('Código enviado! Verifique seu email.')
      setTimeout(() => otpInputRef.current?.focus(), 300)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar código. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otpCode || otpCode.length !== 8) {
      toast.error('Digite o código de 8 dígitos')
      return
    }

    setIsSubmitting(true)

    try {
      await verifyOtp(email.trim().toLowerCase(), otpCode)
      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      if (error.message === 'Token has expired or is invalid') {
        toast.error('Código inválido ou expirado. Tente novamente.')
      } else {
        toast.error(error.message || 'Erro ao verificar código.')
      }
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    setIsSubmitting(true)
    try {
      await sendOtp(email.trim().toLowerCase())
      toast.success('Código reenviado!')
    } catch (error: any) {
      toast.error('Erro ao reenviar código.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 2: OTP verification
  if (step === 'otp') {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif">Verificar Código</CardTitle>
          <CardDescription>
            Enviamos um código de 8 dígitos para <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerifyOtp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otpCode">Código de Acesso</Label>
              <Input
                ref={otpInputRef}
                id="otpCode"
                type="text"
                inputMode="numeric"
                placeholder="00000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                disabled={isSubmitting}
                maxLength={8}
                className="text-center text-2xl tracking-[0.3em] font-bold"
                required
              />
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Verifique também a pasta de spam. Você também pode clicar no link enviado no email.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || otpCode.length !== 8}
            >
              {isSubmitting ? 'Verificando...' : 'Verificar Código'}
            </Button>

            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtpCode('')
                }}
                disabled={isSubmitting}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Usar outro email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSubmitting}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Reenviar código
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    )
  }

  // Step 1: Email input
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-serif">Entrar</CardTitle>
        <CardDescription>
          Digite seu email para receber um código de acesso
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSendOtp}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Código de Acesso'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
