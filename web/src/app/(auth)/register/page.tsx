'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function RegisterPage() {
  const { signUp, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Preencha todos os campos')
      return
    }

    if (!acceptTerms) {
      toast.error('Você precisa aceitar os termos de uso')
      return
    }

    setIsSubmitting(true)

    try {
      // Generate random password (Supabase requires one)
      const randomPassword = crypto.randomUUID() + 'Aa1!'
      await signUp(formData.email, randomPassword, formData.fullName, formData.phone)
      toast.success('Conta criada com sucesso!')
      // Redirect to plans/payment page
      window.location.href = '/plans'
    } catch (error: any) {
      console.error('Register error:', error)

      if (error.message?.includes('already registered')) {
        toast.error('Este email já está cadastrado')
      } else {
        toast.error('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-serif">Criar Conta</CardTitle>
        <CardDescription>
          Cadastre-se para acessar os guidelines médicos
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Seu nome completo"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Eu aceito os{' '}
              <Link href="/terms" className="text-primary hover:underline">
                termos de uso
              </Link>{' '}
              e a{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                política de privacidade
              </Link>
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
