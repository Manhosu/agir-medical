'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Check,
  X,
  Zap,
  Crown,
  Shield,
  Clock,
  Award,
  Lock,
  CreditCard,
  ShieldCheck,
  Target,
  Users,
  MessageCircle,
  BookOpen,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Plan data
const standardPlan = {
  name: "STANDARD",
  description: "Acesso completo ao metodo A.G.I.R.",
  pricePerMonth: "59,90",
  pricePerDay: "R$ 2,00",
  features: [
    "12 meses de acesso completo",
    "Acesso a todo o conteudo pelo App",
    "Guidelines personalizados",
    "Conteudo 100% voltado para o plantao",
    "Grupo exclusivo no WhatsApp",
    "Discussao de casos clinicos reais",
    "Atualizacoes cientificas recorrentes",
  ],
  paymentOptions: [
    { method: "Pix (a vista)", value: "R$ 697,00", highlight: true },
    { method: "Debito", value: "R$ 699,00" },
    { method: "Credito a vista", value: "R$ 719,00" },
    { method: "Credito 3x", value: "3x de R$ 239,00" },
    { method: "Credito 6x", value: "6x de R$ 119,00" },
    { method: "Credito 12x", value: "12x de R$ 59,90" },
  ],
}

const premiumPlan = {
  name: "PREMIUM",
  description: "Metodo A.G.I.R. + suporte clinico avancado",
  pricePerMonth: "99,90",
  pricePerDay: "R$ 3,40",
  features: [
    "Tudo do Plano Standard",
    "Suporte personalizado por WhatsApp",
    "Mentoria clinica com especialistas",
    "Respaldo para casos complexos",
    "Atendimento prioritario",
  ],
  paymentOptions: [
    { method: "Pix (a vista)", value: "R$ 1.147,00", highlight: true },
    { method: "Debito", value: "R$ 1.149,00" },
    { method: "Credito a vista", value: "R$ 1.179,00" },
    { method: "Credito 3x", value: "3x de R$ 399,00" },
    { method: "Credito 6x", value: "6x de R$ 199,00" },
    { method: "Credito 12x", value: "12x de R$ 99,90" },
  ],
}

const comparisonData = [
  { feature: "12 meses de acesso", standard: true, premium: true },
  { feature: "Acesso via App", standard: true, premium: true },
  { feature: "Guidelines personalizados", standard: true, premium: true },
  { feature: "Conteudo pratico para plantao", standard: true, premium: true },
  { feature: "Grupo WhatsApp exclusivo", standard: true, premium: true },
  { feature: "Discussao de casos clinicos", standard: true, premium: true },
  { feature: "Atualizacoes cientificas", standard: true, premium: true },
  { feature: "Suporte personalizado WhatsApp", standard: false, premium: true },
  { feature: "Mentoria com especialistas", standard: false, premium: true },
]

const standardReasons = [
  { icon: Target, text: "Quer um metodo estruturado para avaliar dor abdominal" },
  { icon: Users, text: "Atua em PS ou UPA e precisa de clareza para decidir" },
  { icon: ShieldCheck, text: "Busca seguranca clinica baseada em evidencias" },
  { icon: BookOpen, text: "Prefere estudar no seu ritmo, com apoio do grupo" },
]

const premiumReasons = [
  { icon: MessageCircle, text: "Atua frequentemente sem retaguarda cirurgica imediata" },
  { icon: Target, text: "Enfrenta casos mais complexos ou limitrofes" },
  { icon: Award, text: "Quer suporte direto para discutir condutas" },
  { icon: ShieldCheck, text: "Deseja um nivel extra de seguranca e respaldo" },
]

const faqs = [
  {
    question: "Qual a diferenca entre os planos?",
    answer:
      "O conteudo base e identico. O Plano Premium inclui suporte personalizado via WhatsApp e mentoria clinica com especialistas, ideal para quem atua sem retaguarda cirurgica imediata.",
  },
  {
    question: "Por quanto tempo tenho acesso?",
    answer:
      "Ambos os planos oferecem 12 meses de acesso completo, com atualizacoes cientificas recorrentes durante todo o periodo.",
  },
  {
    question: "Como funciona o acesso ao conteudo?",
    answer:
      "Todo o conteudo fica disponivel em nosso App exclusivo, podendo ser acessado a qualquer momento pelo celular, tablet ou computador.",
  },
  {
    question: "Posso parcelar o pagamento?",
    answer:
      "Sim! Oferecemos parcelamento em ate 12x no cartao de credito. O PIX a vista oferece o melhor desconto.",
  },
  {
    question: "Posso trocar de plano depois?",
    answer:
      "Sim, e possivel fazer upgrade do Standard para o Premium a qualquer momento, pagando apenas a diferenca proporcional.",
  },
]

// PlanCard Component
interface PaymentOption {
  method: string
  value: string
  highlight?: boolean
}

interface PlanCardProps {
  name: string
  description: string
  pricePerMonth: string
  pricePerDay: string
  features: string[]
  paymentOptions: PaymentOption[]
  isPremium?: boolean
  ctaText?: string
  onSelect?: () => void
}

function PlanCard({
  name,
  description,
  pricePerMonth,
  pricePerDay,
  features,
  paymentOptions,
  isPremium = false,
  ctaText = "Quero esse plano",
  onSelect,
}: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl p-[1px] ${
        isPremium
          ? "bg-gradient-to-b from-[hsl(45,93%,58%)]/50 to-[hsl(45,93%,58%)]/10"
          : "bg-gradient-to-b from-primary/50 to-primary/10"
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

      <div
        className={`h-full rounded-2xl p-6 md:p-8 ${
          isPremium ? "glass-strong" : "glass"
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
                isPremium ? "text-[hsl(45,93%,58%)]" : "gradient-text"
              }`}
            >
              {name}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-muted-foreground text-lg">R$</span>
            <span className="text-4xl font-bold text-foreground">
              {pricePerMonth.split(",")[0]}
            </span>
            <span className="text-lg text-muted-foreground">
              ,{pricePerMonth.split(",")[1]}/mes
            </span>
          </div>
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
                  isPremium ? "text-[hsl(45,93%,58%)]" : "text-primary"
                }`}
              />
              <span className="text-sm text-foreground/90">{feature}</span>
            </motion.li>
          ))}
        </ul>

        {/* Payment Options */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Formas de Pagamento
          </h4>
          <div className="space-y-2">
            {paymentOptions.map((option, index) => (
              <div
                key={index}
                className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${
                  option.highlight
                    ? isPremium
                      ? "bg-[hsl(45,93%,58%)]/10 border border-[hsl(45,93%,58%)]/20"
                      : "bg-primary/10 border border-primary/20"
                    : ""
                }`}
              >
                <span
                  className={
                    option.highlight
                      ? isPremium
                        ? "text-[hsl(45,93%,58%)] font-medium"
                        : "text-primary font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {option.method}
                </span>
                <span
                  className={`font-semibold ${
                    option.highlight ? "text-foreground" : "text-foreground/80"
                  }`}
                >
                  {option.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          variant={isPremium ? "ctaPremium" : "cta"}
          size="xl"
          className="w-full"
          onClick={onSelect}
        >
          {ctaText}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          12 meses de acesso - Pagamento seguro
        </p>
      </div>
    </motion.div>
  )
}

// Links de pagamento InfinitePay
const PAYMENT_LINKS = {
  standard: 'https://invoice.infinitepay.io/programa-agir/79t6sJUR6R/',
  premium: 'https://invoice.infinitepay.io/programa-agir/1myI0LkHxv/',
}

export default function PlansPage() {
  const handlePlanSelect = (planName: 'standard' | 'premium') => {
    window.open(PAYMENT_LINKS[planName], '_blank')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="font-display text-xl font-bold text-primary">A</span>
              </div>
              <span className="font-display font-bold text-foreground hidden sm:block">
                A.G.I.R.
              </span>
            </div>
            <Link href="/login">
              <Button variant="ghost" size="sm">Ja sou aluno</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-sm text-primary font-medium">
                Ultimas vagas com condicao especial
              </span>
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight font-display">
              Escolha seu plano e tenha
              <span className="block gradient-text mt-1">
                seguranca no plantao
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 text-balance">
              O metodo A.G.I.R. que voce precisa para avaliar dor abdominal com
              clareza, organizacao e respaldo cientifico.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
            >
              {[
                { icon: Shield, text: "Metodo validado" },
                { icon: Clock, text: "Acesso imediato" },
                { icon: Award, text: "Conteudo pratico para o plantao" },
              ].map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <PlanCard
              {...standardPlan}
              ctaText="Comecar com Standard"
              onSelect={() => handlePlanSelect("standard")}
            />
            <PlanCard
              {...premiumPlan}
              isPremium
              ctaText="Quero o Premium"
              onSelect={() => handlePlanSelect("premium")}
            />
          </div>
        </div>
      </section>

      {/* Plans Comparison */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
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
            className="glass rounded-2xl overflow-hidden max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 border-b border-border">
              <div className="text-sm font-medium text-muted-foreground">
                Recurso
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold gradient-text">
                  Standard
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-[hsl(45,93%,58%)]">
                  Premium
                </span>
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
        </div>
      </section>

      {/* Plan Recommendation */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3 font-display">
              Qual plano escolher?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ambos os planos oferecem acesso completo ao metodo A.G.I.R. A
              diferenca esta no nivel de acompanhamento e suporte clinico.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3 font-display">
              Perguntas frequentes
            </h2>
            <p className="text-muted-foreground">
              Tire suas duvidas sobre os planos
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-8 mb-8"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-sm">Pagamento 100% seguro</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-sm">Parcelamento em ate 12x</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm">Garantia de 7 dias</span>
            </div>
          </motion.div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Programa A.G.I.R. &copy; {new Date().getFullYear()} - Todos os direitos reservados
            </p>
            <p className="text-xs text-muted-foreground/60">
              Desenvolvido para profissionais de saude que buscam excelencia na
              avaliacao de abdome agudo
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
