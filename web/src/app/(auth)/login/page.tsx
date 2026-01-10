'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signOut, isLoading, user, isAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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

    if (!email || !password) {
      toast.error('Preencha todos os campos')
      return
    }

    setIsSubmitting(true)

    // Login direto com Supabase (sem usar o hook)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos')
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Confirme seu email antes de fazer login')
      } else {
        toast.error('Erro ao fazer login. Tente novamente.')
      }
      setIsSubmitting(false)
      return
    }

    if (!data.user) {
      toast.error('Erro ao fazer login. Tente novamente.')
      setIsSubmitting(false)
      return
    }

    toast.success('Login realizado com sucesso!')

    // Buscar perfil para verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    // Redirecionar baseado no role
    if (profile?.role === 'admin') {
      window.location.href = '/admin'
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-serif">Entrar</CardTitle>
        <CardDescription>
          Digite seu email e senha para acessar sua conta
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
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
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
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
