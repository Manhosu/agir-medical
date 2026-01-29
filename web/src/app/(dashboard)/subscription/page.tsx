'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  Zap,
  Crown,
  Shield,
  Clock,
  Award,
  AlertCircle,
  Target,
  Users,
  MessageCircle,
  BookOpen,
  ShieldCheck,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Links de pagamento InfinitePay
const PAYMENT_LINKS = {
  standard: 'https://invoice.infinitepay.io/programa-agir/79t6sJUR6R/',
  premium: 'https://invoice.infinitepay.io/programa-agir/1myI0LkHxv/',
}

interface Subscription {
  id: string
  status: string
  plan: string
  starts_at: string
  expires_at: string
}

// Dados dos planos - Valores com promocao de lancamento
const standardPlan = {
  name: 'STANDARD',
  description: 'Acesso completo ao metodo A.G.I.R.',
  pricePerMonth: '59,90',
  promoPrice: '49,90',
  promoLabel: 'Oferta exclusiva de lancamento',
  pricePerDay: 'R$ 1,70',
  features: [
    '12 meses de acesso completo',
    'Acesso a todo o conteudo pelo App',
    'Guidelines personalizados',
    'Conteudo 100% voltado para o plantao',
    'Grupo exclusivo no WhatsApp',
    'Discussao de casos clinicos reais',
    'Atualizacoes cientificas recorrentes',
  ],
  paymentOptions: [
    { method: 'Pix', highlight: true },
    { method: 'Debito' },
    { method: 'Credito - em ate 12 vezes' },
  ],
}

const premiumPlan = {
  name: 'PREMIUM',
  description: 'Metodo A.G.I.R. + suporte clinico avancado',
  pricePerMonth: '99,90',
  promoPrice: '79,90',
  promoLabel: 'Oferta exclusiva de lancamento',
  pricePerDay: 'R$ 2,70',
  features: [
    'Tudo do Plano Standard',
    'Suporte personalizado por WhatsApp',
    'Mentoria clinica com especialistas',
    'Respaldo para casos complexos',
    'Atendimento prioritario',
  ],
  paymentOptions: [
    { method: 'Pix', highlight: true },
    { method: 'Debito' },
    { method: 'Credito - em ate 12 vezes' },
  ],
}

const comparisonData = [
  { feature: '12 meses de acesso', standard: true, premium: true },
  { feature: 'Acesso via App', standard: true, premium: true },
  { feature: 'Guidelines personalizados', standard: true, premium: true },
  { feature: 'Conteudo pratico para plantao', standard: true, premium: true },
  { feature: 'Grupo WhatsApp exclusivo', standard: true, premium: true },
  { feature: 'Discussao de casos clinicos', standard: true, premium: true },
  { feature: 'Atualizacoes cientificas', standard: true, premium: true },
  { feature: 'Suporte personalizado WhatsApp', standard: false, premium: true },
  { feature: 'Mentoria com especialistas', standard: false, premium: true },
]

const standardReasons = [
  { icon: Target, text: 'Quer um metodo estruturado para avaliar dor abdominal' },
  { icon: Users, text: 'Atua em PS ou UPA e precisa de clareza para decidir' },
  { icon: ShieldCheck, text: 'Busca seguranca clinica baseada em evidencias' },
  { icon: BookOpen, text: 'Prefere estudar no seu ritmo, com apoio do grupo' },
]

const premiumReasons = [
  { icon: MessageCircle, text: 'Atua frequentemente sem retaguarda cirurgica imediata' },
  { icon: Target, text: 'Enfrenta casos mais complexos ou limitrofes' },
  { icon: Award, text: 'Quer suporte direto para discutir condutas' },
  { icon: ShieldCheck, text: 'Deseja um nivel extra de seguranca e respaldo' },
]

const faqs = [
  {
    question: 'Qual a diferenca entre os planos?',
    answer:
      'O conteudo base e identico. O Plano Premium inclui suporte personalizado via WhatsApp e mentoria clinica com especialistas, ideal para quem atua sem retaguarda cirurgica imediata.',
  },
  {
    question: 'Por quanto tempo tenho acesso?',
    answer:
      'Ambos os planos oferecem 12 meses de acesso completo, com atualizacoes cientificas recorrentes durante todo o periodo.',
  },
  {
    question: 'Como funciona o acesso ao conteudo?',
    answer:
      'Todo o conteudo fica disponivel em nosso App exclusivo, podendo ser acessado a qualquer momento pelo celular, tablet ou computador.',
  },
  {
    question: 'Posso parcelar o pagamento?',
    answer:
      'Sim! Oferecemos parcelamento em ate 12x no cartao de credito. O PIX a vista oferece o melhor desconto.',
  },
  {
    question: 'Posso trocar de plano depois?',
    answer:
      'Sim, e possivel fazer upgrade do Standard para o Premium a qualquer momento, pagando apenas a diferenca proporcional.',
  },
]

// Componente PlanCard
interface PaymentOption {
  method: string
  value?: string
  highlight?: boolean
}

interface PlanCardProps {
  name: string
  description: string
  pricePerMonth: string
  promoPrice?: string
  promoLabel?: string
  pricePerDay: string
  features: string[]
  paymentOptions: PaymentOption[]
  isPremium?: boolean
  ctaText?: string
  onSelect?: () => void
  disabled?: boolean
  isCurrentPlan?: boolean
}

function PlanCard({
  name,
  description,
  pricePerMonth,
  promoPrice,
  promoLabel,
  pricePerDay,
  features,
  paymentOptions,
  isPremium = false,
  ctaText = 'Quero esse plano',
  onSelect,
  disabled = false,
  isCurrentPlan = false,
}: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl p-[1px] ${
        isPremium
          ? 'bg-gradient-to-b from-[hsl(45,93%,58%)]/50 to-[hsl(45,93%,58%)]/10'
          : 'bg-gradient-to-b from-primary/50 to-primary/10'
      }`}
    >
      {isPremium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-[hsl(45,93%,58%)] text-[hsl(220,30%,6%)] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Mais completo
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4 z-10">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Seu plano
          </span>
        </div>
      )}

      <div
        className={`h-full rounded-2xl p-6 md:p-8 ${
          isPremium ? 'glass-strong' : 'glass'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isPremium ? (
              <Crown className="w-6 h-6 text-[hsl(45,93%,58%)]" />
            ) : (
              <Zap className="w-6 h-6 text-primary" />
            )}
            <h3
              className={`text-2xl font-bold ${
                isPremium ? 'text-[hsl(45,93%,58%)]' : 'gradient-text'
              }`}
            >
              {name}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          {promoLabel && (
            <div className="mb-3">
              <span className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {promoLabel}
              </span>
            </div>
          )}
          {promoPrice ? (
            <>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-muted-foreground text-sm line-through">R$ {pricePerMonth}/mes</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-primary text-lg">R$</span>
                <span className="text-4xl font-bold text-primary">
                  {promoPrice.split(',')[0]}
                </span>
                <span className="text-lg text-primary">
                  ,{promoPrice.split(',')[1]}/mes
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-muted-foreground text-lg">R$</span>
              <span className="text-4xl font-bold text-foreground">
                {pricePerMonth.split(',')[0]}
              </span>
              <span className="text-lg text-muted-foreground">
                ,{pricePerMonth.split(',')[1]}/mes
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Menos de <span className="text-primary font-medium">{pricePerDay}</span> por dia
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <Check
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isPremium ? 'text-[hsl(45,93%,58%)]' : 'text-primary'
                }`}
              />
              <span className="text-sm text-foreground/90">{feature}</span>
            </motion.li>
          ))}
        </ul>

        {/* Payment Options */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
            Formas de Pagamento
          </h4>
          <div className="space-y-2 flex flex-col items-center">
            {paymentOptions.map((option, index) => (
              <div
                key={index}
                className={`flex justify-center items-center py-2 px-4 rounded-lg text-sm ${
                  option.highlight
                    ? isPremium
                      ? 'bg-[hsl(45,93%,58%)]/10 border border-[hsl(45,93%,58%)]/20'
                      : 'bg-primary/10 border border-primary/20'
                    : ''
                }`}
              >
                <span
                  className={
                    option.highlight
                      ? isPremium
                        ? 'text-[hsl(45,93%,58%)] font-medium'
                        : 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }
                >
                  {option.method}
                </span>
                {option.value && (
                  <span
                    className={`font-semibold ml-2 ${
                      option.highlight ? 'text-foreground' : 'text-foreground/80'
                    }`}
                  >
                    {option.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          variant={isPremium ? 'ctaPremium' : 'cta'}
          size="xl"
          className="w-full"
          onClick={onSelect}
          disabled={disabled}
        >
          {isCurrentPlan ? 'Plano Atual' : ctaText}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          12 meses de acesso - Pagamento seguro
        </p>
      </div>
    </motion.div>
  )
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
        .eq('status', 'active')
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

  const handlePlanSelect = (planName: 'standard' | 'premium') => {
    window.open(PAYMENT_LINKS[planName], '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const daysUntilExpiration = () => {
    if (!subscription?.expires_at) return 0
    const now = new Date()
    const expires = new Date(subscription.expires_at)
    const diff = expires.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const currentPlan = subscription?.plan?.toLowerCase() || null

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            {hasActiveSubscription ? 'Sua Assinatura' : 'Escolha seu plano'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {hasActiveSubscription
              ? 'Gerencie sua assinatura e acompanhe seu acesso ao Programa A.G.I.R.'
              : 'Tenha acesso completo ao metodo A.G.I.R. e transforme sua pratica clinica no plantao.'}
          </p>
        </motion.div>
      </div>

      {/* Status da Assinatura Atual */}
      {hasActiveSubscription && subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-primary/30"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">
                    Plano {subscription.plan?.toUpperCase()}
                  </h2>
                  <Badge variant="default" className="bg-primary">
                    Ativo
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Acesso ate {formatDate(subscription.expires_at)}
                </p>
              </div>
            </div>

            {daysUntilExpiration() <= 30 && daysUntilExpiration() > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-medium">
                  Expira em {daysUntilExpiration()} dias
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Sem assinatura - aviso */}
      {!hasActiveSubscription && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-destructive/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Sem Assinatura Ativa</h2>
              <p className="text-sm text-muted-foreground">
                Escolha um plano abaixo para ter acesso completo ao conteudo
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
      >
        {[
          { icon: Shield, text: 'Metodo validado' },
          { icon: Clock, text: 'Acesso imediato' },
          { icon: Award, text: 'Conteudo pratico para o plantao' },
        ].map((badge, index) => (
          <div key={index} className="flex items-center gap-2 text-muted-foreground">
            <badge.icon className="w-4 h-4 text-primary" />
            <span className="text-sm">{badge.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Plans Section */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        <PlanCard
          {...standardPlan}
          ctaText={hasActiveSubscription ? 'Renovar Standard' : 'Comecar com Standard'}
          onSelect={() => handlePlanSelect('standard')}
          isCurrentPlan={currentPlan === 'standard'}
        />
        <PlanCard
          {...premiumPlan}
          isPremium
          ctaText={hasActiveSubscription ? 'Upgrade para Premium' : 'Quero o Premium'}
          onSelect={() => handlePlanSelect('premium')}
          isCurrentPlan={currentPlan === 'premium'}
        />
      </div>

      {/* Plans Comparison */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3 font-display">
            Compare os planos
          </h2>
          <p className="text-muted-foreground">
            O conteudo base e o mesmo. O que muda e o nivel de acompanhamento.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 border-b border-border">
            <div className="text-sm font-medium text-muted-foreground">Recurso</div>
            <div className="text-center">
              <span className="text-sm font-semibold gradient-text">Standard</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-semibold text-[hsl(45,93%,58%)]">Premium</span>
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {comparisonData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors"
              >
                <div className="text-sm text-foreground/90">{item.feature}</div>
                <div className="flex justify-center">
                  {item.standard ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex justify-center">
                  {item.premium ? (
                    <Check className="w-5 h-5 text-[hsl(45,93%,58%)]" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Plan Recommendation */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3 font-display">
            Qual plano escolher?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ambos os planos oferecem acesso completo ao metodo A.G.I.R. A diferenca esta no
            nivel de acompanhamento e suporte clinico.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold gradient-text mb-2 font-display">
              Escolha Standard se voce:
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ideal para quem quer metodo, organizacao e decisao segura.
            </p>
            <ul className="space-y-3">
              {standardReasons.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground/90">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-2xl p-6 border border-[hsl(45,93%,58%)]/20"
          >
            <h3 className="text-xl font-bold text-[hsl(45,93%,58%)] mb-2 font-display">
              Escolha Premium se voce:
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ideal para quem quer metodo + acompanhamento proximo.
            </p>
            <ul className="space-y-3">
              {premiumReasons.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <item.icon className="w-5 h-5 text-[hsl(45,93%,58%)] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground/90">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3 font-display">
            Perguntas frequentes
          </h2>
          <p className="text-muted-foreground">Tire suas duvidas sobre os planos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass rounded-xl border-none px-6"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>
    </div>
  )
}
