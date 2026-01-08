'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, Crown, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

interface Subscription {
  id: string
  status: string
  plan: string
  starts_at: string
  expires_at: string
}

export default function SubscriptionPage() {
  const { user, hasActiveSubscription } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSubscription()
  }, [user])

  const loadSubscription = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error loading subscription:', error)
      } else if (data && data.length > 0) {
        setSubscription(data[0])
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = () => {
    // TODO: Integrar com gateway de pagamento
    toast.info('Sistema de pagamento em implementacao. Entre em contato para ativar sua assinatura.')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const daysUntilExpiration = () => {
    if (!subscription?.expires_at) return 0
    const now = new Date()
    const expires = new Date(subscription.expires_at)
    const diff = expires.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold">Assinatura</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie sua assinatura e tenha acesso a todo o conteudo
        </p>
      </div>

      {/* Status Atual */}
      {hasActiveSubscription && subscription ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Assinatura Ativa</CardTitle>
                  <CardDescription>Plano {subscription.plan}</CardDescription>
                </div>
              </div>
              <Badge variant="default" className="bg-primary">
                Ativo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Inicio</p>
                <p className="font-medium">{formatDate(subscription.starts_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expira em</p>
                <p className="font-medium">{formatDate(subscription.expires_at)}</p>
              </div>
            </div>

            {daysUntilExpiration() <= 30 && daysUntilExpiration() > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-amber-800 dark:text-amber-200">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Sua assinatura expira em {daysUntilExpiration()} dias
                </span>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <p className="font-medium">Beneficios inclusos:</p>
              <ul className="space-y-2">
                {[
                  'Acesso a todos os cursos',
                  'Novos conteudos adicionados regularmente',
                  'Acesso via web e aplicativo mobile',
                  'Certificados de conclusao',
                  'Suporte prioritario',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleSubscribe}>
              Renovar Assinatura
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div>
                <CardTitle>Sem Assinatura Ativa</CardTitle>
                <CardDescription>
                  Assine para ter acesso a todo o conteudo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Planos */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-semibold">Planos Disponiveis</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Plano Anual */}
          <Card className="relative border-primary">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary">Mais Popular</Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">Plano Anual</CardTitle>
              <CardDescription>Melhor custo-beneficio</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <span className="text-4xl font-bold">R$ 497</span>
                <span className="text-muted-foreground">/ano</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Equivale a R$ 41,42/mes
              </p>
              <Separator />
              <ul className="space-y-3 text-left">
                {[
                  'Acesso a todos os cursos',
                  'Atualizacoes por 12 meses',
                  'App mobile incluso',
                  'Certificados de conclusao',
                  'Suporte via email',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubscribe}
                disabled={hasActiveSubscription}
              >
                {hasActiveSubscription ? 'Ja Assinante' : 'Assinar Agora'}
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Semestral */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Plano Semestral</CardTitle>
              <CardDescription>Para quem quer comecar</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <span className="text-4xl font-bold">R$ 297</span>
                <span className="text-muted-foreground">/6 meses</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Equivale a R$ 49,50/mes
              </p>
              <Separator />
              <ul className="space-y-3 text-left">
                {[
                  'Acesso a todos os cursos',
                  'Atualizacoes por 6 meses',
                  'App mobile incluso',
                  'Certificados de conclusao',
                  'Suporte via email',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleSubscribe}
                disabled={hasActiveSubscription}
              >
                {hasActiveSubscription ? 'Ja Assinante' : 'Assinar'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-semibold">Duvidas Frequentes</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Como funciona o acesso?',
              a: 'Apos a confirmacao do pagamento, seu acesso e liberado imediatamente. Voce pode acessar pelo site ou aplicativo mobile.'
            },
            {
              q: 'Posso cancelar a qualquer momento?',
              a: 'Sim, voce pode cancelar quando quiser. O acesso permanece ativo ate o fim do periodo pago.'
            },
            {
              q: 'E se eu tiver problemas de acesso?',
              a: 'Entre em contato com nosso suporte que resolveremos rapidamente.'
            },
            {
              q: 'Aceita quais formas de pagamento?',
              a: 'Cartao de credito (parcelado em ate 12x) e PIX com desconto.'
            },
          ].map((item, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
