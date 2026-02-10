'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const { signOut, isLoading, user, isAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [showLoggedInState, setShowLoggedInState] = useState(false)

  // Mostrar estado "já logado" apenas depois que confirmar que há usuário
  useEffect(() => {
    if (!isLoading && user) {
      setShowLoggedInState(true)
    }
  }, [isLoading, user])

  // Se já está logado e já carregou, mostrar opção de continuar ou trocar conta
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Digite seu email')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error('Erro ao enviar link. Tente novamente.')
        setIsSubmitting(false)
        return
      }

      setLinkSent(true)
      toast.success('Link de acesso enviado!')
    } catch (error) {
      toast.error('Erro ao enviar link. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Link enviado - mostrar confirmacao
  if (linkSent) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif">Verifique seu Email</CardTitle>
          <CardDescription>
            Enviamos um link de acesso para <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Clique no link que enviamos para seu email para acessar sua conta.
            Verifique também a pasta de spam.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setLinkSent(false)
              setEmail('')
            }}
          >
            Usar outro email
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-serif">Entrar</CardTitle>
        <CardDescription>
          Digite seu email para receber um link de acesso
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

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Link de Acesso'}
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
