'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Digite seu email')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword(email)
      setEmailSent(true)
      toast.success('Email enviado! Verifique sua caixa de entrada.')
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error('Erro ao enviar email. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif">Email Enviado!</CardTitle>
          <CardDescription>
            Enviamos um link de recuperação para <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Verifique sua caixa de entrada e spam. O link é válido por 24 horas.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            Enviar novamente
          </Button>

          <Link href="/login" className="text-sm text-primary hover:underline">
            Voltar para o login
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-serif">Esqueceu a Senha?</CardTitle>
        <CardDescription>
          Digite seu email e enviaremos um link para redefinir sua senha
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
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

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>

          <Link href="/login" className="text-sm text-primary hover:underline">
            Voltar para o login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
