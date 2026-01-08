'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // O Supabase envia o token como hash fragment
  // Isso é tratado automaticamente pelo cliente Supabase

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error('Preencha todos os campos')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(password)
      setIsSuccess(true)
      toast.success('Senha alterada com sucesso!')
    } catch (error: any) {
      console.error('Reset password error:', error)

      if (error.message?.includes('same password')) {
        toast.error('A nova senha deve ser diferente da atual')
      } else {
        toast.error('Erro ao alterar senha. O link pode ter expirado.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif">Senha Alterada!</CardTitle>
          <CardDescription>
            Sua senha foi alterada com sucesso
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button>Ir para o Login</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-serif">Nova Senha</CardTitle>
        <CardDescription>
          Digite sua nova senha
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
          </Button>

          <Link href="/login" className="text-sm text-primary hover:underline">
            Voltar para o login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
