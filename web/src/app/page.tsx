'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Shield,
  Smartphone,
  Clock,
  CheckCircle,
  Users,
  Award,
  FileText,
  ArrowRight,
  Play,
  Star,
  Stethoscope,
  GraduationCap,
  LockKeyhole,
  Zap,
  RefreshCw,
  AlertTriangle,
  Target,
  Search,
  Brain,
  MessageSquare,
  X
} from "lucide-react"

const tocItems = [
  { id: 'problema', label: '1. O Problema' },
  { id: 'metodo', label: '2. Metodo A.G.I.R.' },
  { id: 'para-quem', label: '3. Para Quem' },
  { id: 'conteudo', label: '4. Conteudo' },
  { id: 'diferenciais', label: '5. Diferenciais' },
  { id: 'bonus', label: '6. Bonus' },
  { id: 'pricing', label: '7. Investimento' },
  { id: 'faq', label: '8. FAQ' },
]

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>('')
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll spy - detect current section and show/hide TOC
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true)

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 1500)

      const sections = tocItems.map(item => document.getElementById(item.id)).filter(Boolean)
      const scrollPosition = window.scrollY + 150

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(tocItems[i].id)
          return
        }
      }
      setActiveSection('')
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, targetId: string) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (!target) return

    const headerOffset = 80
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold text-foreground font-serif">A.G.I.R.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#metodo"
              onClick={(e) => scrollToSection(e, 'metodo')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Metodo
            </a>
            <a
              href="#conteudo"
              onClick={(e) => scrollToSection(e, 'conteudo')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Conteudo
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Investimento
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Quero Participar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Floating Table of Contents */}
      <aside
        className={`hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 z-40 transition-opacity duration-300 ${
          isScrolling ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Indice
          </h3>
          <ul className="space-y-1">
            {tocItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`text-left w-full text-sm py-1.5 px-3 rounded-md transition-colors ${
                    activeSection === item.id
                      ? 'text-primary font-medium bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
              <Stethoscope className="w-4 h-4" />
              Programa de Formacao Medica
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground font-serif mb-6 leading-tight">
              <span className="text-primary">A</span>bdome Agudo{' '}
              <span className="text-primary">G</span>uiado por{' '}
              <span className="text-primary">I</span>nvestigacao e{' '}
              <span className="text-primary">R</span>aciocinio
            </h1>

            <p className="text-xl md:text-2xl text-foreground font-medium mb-4">
              Nao enfrente o plantao sozinho. Tenha respaldo para decidir.
            </p>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
              Aprenda o que fazer, quando fazer e quando transferir diante das principais
              patologias cirurgicas de urgencia e emergencia no plantao.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" className="px-8 h-14 text-lg gap-2">
                  <Play className="w-5 h-5" />
                  Quero Aprender o Metodo A.G.I.R.
                </Button>
              </Link>
              <a
                href="#metodo"
                onClick={(e) => scrollToSection(e, 'metodo')}
                className="cursor-pointer"
              >
                <Button size="lg" variant="outline" className="px-8 h-14 text-lg gap-2">
                  Conhecer o Metodo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm">Foco no Plantao Real</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm">Raciocinio Estruturado</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Decisoes Seguras</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-border bg-card">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">4</div>
              <div className="text-muted-foreground">Pilares do Metodo</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">20+</div>
              <div className="text-muted-foreground">Patologias Abordadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">100%</div>
              <div className="text-muted-foreground">Pratico e Aplicavel</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">24/7</div>
              <div className="text-muted-foreground">Acesso Ilimitado</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problema" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-primary font-medium mb-4 block">O PROBLEMA</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
                Atender dor abdominal no pronto-socorro e diferente de qualquer outro atendimento.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {[
                { icon: AlertTriangle, text: "Sintomas inespecificos" },
                { icon: Search, text: "Diagnosticos que se sobrepoem" },
                { icon: Clock, text: "Pressao por decisoes rapidas" },
                { icon: AlertTriangle, text: "Medo de errar ou atrasar um diagnostico grave" },
                { icon: Users, text: "Pouco suporte cirurgico na retaguarda" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <item.icon className="w-6 h-6 text-destructive flex-shrink-0" />
                  <span className="text-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-lg text-muted-foreground mb-4">A verdade e simples:</p>
              <p className="text-xl md:text-2xl font-semibold text-foreground mb-6">
                O abdome agudo e uma das principais causas de <span className="text-destructive">erro</span>, <span className="text-destructive">inseguranca</span> e <span className="text-destructive">estresse</span> no plantao medico.
              </p>
              <p className="text-muted-foreground mb-8">
                E nao porque voce nao sabe medicina — mas porque <strong className="text-foreground">ninguem te ensinou um metodo claro para decidir</strong>.
              </p>
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Quero Parar de Improvisar no Abdome Agudo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Method Section - 4 Pillars */}
      <section id="metodo" className="py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">O METODO A.G.I.R.</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
              E exatamente por isso que o A.G.I.R. foi criado.
            </h2>
            <p className="text-lg text-muted-foreground">
              O A.G.I.R. e um programa de formacao medica desenvolvido para oferecer <strong className="text-foreground">metodo</strong>, <strong className="text-foreground">organizacao mental</strong> e <strong className="text-foreground">seguranca clinica</strong> no atendimento da dor abdominal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                letter: "A",
                title: "Avaliacao Estruturada",
                desc: "Historia clinica dirigida, exame fisico com proposito e identificacao precoce de gravidade."
              },
              {
                letter: "G",
                title: "Guiado por Evidencias",
                desc: "Fluxos claros, prioridades bem definidas e decisoes fundamentadas."
              },
              {
                letter: "I",
                title: "Investigacao Inteligente",
                desc: "Solicite apenas exames que impactam a conduta — e aprenda a interpreta-los corretamente."
              },
              {
                letter: "R",
                title: "Raciocinio para Acao",
                desc: "Classifique risco, tome decisoes seguras e encaminhe com informacoes relevantes."
              }
            ].map((pillar, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-16 h-16 bg-primary/10 rounded-br-full flex items-start justify-start p-2">
                  <span className="text-3xl font-bold text-primary font-serif">{pillar.letter}</span>
                </div>
                <CardHeader className="pt-16">
                  <CardTitle className="font-serif text-lg">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{pillar.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg text-foreground font-medium mb-6">
              Esse metodo muda completamente a forma como voce encara o abdome agudo.
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Quero Decidir com Clareza no Plantao
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section id="para-quem" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-medium mb-4 block">PARA QUEM E O A.G.I.R.</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
                Este programa foi feito para quem esta na linha de frente
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Se voce atende dor abdominal e sente inseguranca, o A.G.I.R. e para voce.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "Estudantes em internato de medicina",
                  "Recem-formados iniciando plantoes",
                  "Medicos generalistas",
                  "Medicos de UPA e PS clinico",
                  "Revalidantes",
                  "Residentes de Clinica Medica, GO e Medicina de Familia",
                  "Profissionais em hospitais sem equipe de Cirurgia Geral"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-6 font-serif">O que voce vai aprender na pratica:</h3>
              <div className="space-y-4">
                {[
                  "Como estruturar o raciocinio clinico desde a anamnese",
                  "Quais sinais de alerta realmente mudam conduta",
                  "Quais exames solicitar — e quais evitar",
                  "Como classificar gravidade e risco",
                  "Quando observar, quando estabilizar e quando encaminhar",
                  "Como organizar e apresentar um caso ao cirurgiao",
                  "Prescricoes objetivas e aplicaveis ao plantao real"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Tudo com foco no que <strong className="text-foreground">realmente importa na vida real</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="conteudo" className="py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">CONTEUDO</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Patologias Abordadas
            </h2>
            <p className="text-muted-foreground text-lg">
              Conteudo completo sobre as principais patologias cirurgicas de urgencia e emergencia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Dor Abdominal - Abordagem Geral",
              "Apendicite Aguda",
              "Pancreatite Aguda",
              "Colecistite Aguda",
              "Colangite Aguda",
              "Diverticulite Aguda",
              "Abdome Agudo Obstrutivo",
              "Abdome Agudo Perfurativo",
              "Isquemia Mesenterica",
              "DRGE",
              "Hernia Inguinal",
              "Hernia Umbilical",
              "Volvo de Sigmoide",
              "Ulcera Peptica Perfurada",
              "Abscesso Hepatico",
              "Ureterolitiase"
            ].map((title, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
              >
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{title}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <GraduationCap className="w-5 h-5" />
                Quero Dominar a Avaliacao do Abdome Agudo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section id="diferenciais" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">DIFERENCIAIS</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
              Por que o A.G.I.R. e diferente?
            </h2>
            <p className="text-lg text-muted-foreground">
              Porque ele foi desenvolvido para a realidade do plantao — <strong className="text-foreground">sem teoria excessiva, sem floreios, sem conteudos desconectados da pratica</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Raciocinio Clinico Estruturado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Aprenda a formular hipoteses diagnosticas coerentes, reconhecer padroes clinicos e entender quais dados realmente fazem diferenca.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Condutas Claras e Seguras</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Saiba exatamente o que fazer diante de cada contexto: quais exames solicitar, quando observar, quando estabilizar, quando referenciar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Prescricao Orientada pela Pratica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Indicacoes objetivas, protocolos aplicaveis e modelos de prescricao para a vida real — nao apenas para provas.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Communication with Surgery */}
          <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
            <div className="max-w-3xl mx-auto text-center">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold font-serif mb-4">
                Comunicacao com a Equipe de Cirurgia Geral
              </h3>
              <p className="text-muted-foreground mb-6">
                Um dos maiores diferenciais do A.G.I.R. e ensinar como se comunicar corretamente com servicos de referencia cirurgica.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
                {[
                  "O que nao pode faltar ao apresentar um caso",
                  "Como organizar as informacoes",
                  "Como transmitir seguranca e clareza",
                  "Como evitar encaminhamentos frageis"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary font-medium mt-6">
                Isso muda a forma como voce e visto como profissional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bonus Section */}
      <section id="bonus" className="py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">MUITO ALEM DAS AULAS</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Ao entrar no A.G.I.R., voce tambem tera acesso a:
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: MessageSquare, title: "Grupo Exclusivo no Telegram", desc: "Comunidade ativa de profissionais" },
              { icon: Users, title: "Discussao de Casos Clinicos Reais", desc: "Aprenda com casos do dia a dia" },
              { icon: RefreshCw, title: "Atualizacoes Cientificas", desc: "Conteudo sempre atualizado" },
              { icon: Stethoscope, title: "Suporte da Equipe", desc: "Tire suas duvidas" }
            ].map((bonus, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-background border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <bonus.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{bonus.title}</h3>
                <p className="text-sm text-muted-foreground">{bonus.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-lg text-foreground font-medium">
              O A.G.I.R. e uma <span className="text-primary">comunidade de formacao clinica continua</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Transformation Block */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-center mb-12">
              Com o A.G.I.R., voce deixa de:
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                  <X className="w-5 h-5" /> Antes
                </h3>
                {[
                  "Improvisar",
                  "Atender com medo",
                  "Encaminhar sem seguranca"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <X className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* After */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Depois
                </h3>
                {[
                  "Decidir com metodo",
                  "Atender com clareza",
                  "Agir com confianca"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-xl font-semibold text-foreground mb-2">
                O abdome agudo nao permite improviso.
              </p>
              <p className="text-primary font-medium mb-8">
                Ele exige metodo, raciocinio e decisao responsavel.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-lg gap-2">
                  Quero Entrar para o A.G.I.R. Agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">INVESTIMENTO</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Invista na sua seguranca clinica
            </h2>
            <p className="text-muted-foreground text-lg">
              Acesso completo ao metodo que vai transformar seus plantoes.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  ACESSO COMPLETO
                </span>
              </div>
              <CardHeader className="text-center pb-0">
                <CardTitle className="text-2xl font-serif">Assinatura Anual</CardTitle>
                <CardDescription>Acesso ilimitado por 12 meses</CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-8">
                <div className="mb-8">
                  <span className="text-5xl font-bold font-serif">R$ 297</span>
                  <span className="text-muted-foreground">/ano</span>
                </div>

                <div className="space-y-3 text-left mb-8">
                  {[
                    "Acesso a todo o conteudo do metodo A.G.I.R.",
                    "Todas as patologias abordadas",
                    "Grupo exclusivo no Telegram",
                    "Discussao de casos clinicos",
                    "Atualizacoes incluidas",
                    "Suporte da equipe",
                    "Acesso web + mobile"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/register" className="block">
                  <Button size="lg" className="w-full h-14 text-lg">
                    Quero Entrar para o A.G.I.R.
                  </Button>
                </Link>

                <p className="text-xs text-muted-foreground mt-4">
                  Pagamento seguro via cartao ou PIX
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-card">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium mb-4 block">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Para quem e o A.G.I.R.?",
                a: "O A.G.I.R. foi criado para estudantes de medicina em internato, recem-formados, medicos generalistas, emergencistas de UPA e PS, revalidantes e residentes que atendem dor abdominal e buscam mais seguranca clinica."
              },
              {
                q: "O conteudo e atualizado?",
                a: "Sim! Atualizamos o conteudo regularmente com base nos consensos e evidencias mais recentes. Todas as atualizacoes estao incluidas na sua assinatura."
              },
              {
                q: "Posso acessar de qualquer dispositivo?",
                a: "Sim, voce pode acessar pela web ou pelo app mobile. Seu progresso sincroniza automaticamente entre os dispositivos."
              },
              {
                q: "Como funciona o grupo do Telegram?",
                a: "Ao assinar, voce recebe acesso ao grupo exclusivo onde discutimos casos clinicos, tiramos duvidas e compartilhamos atualizacoes cientificas."
              },
              {
                q: "E se eu tiver duvidas sobre um caso especifico?",
                a: "Voce pode discutir casos no grupo do Telegram e contar com o suporte da equipe do programa para orientacoes."
              },
              {
                q: "Como funciona o pagamento?",
                a: "Aceitamos cartao de credito e PIX. O pagamento e anual e voce tem acesso completo durante 12 meses."
              }
            ].map((faq, index) => (
              <div key={index} className="p-6 rounded-lg bg-background border border-border">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary-foreground mb-6">
            Se voce quer atender dor abdominal com seguranca, clareza e confianca, o A.G.I.R. foi feito para voce.
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-10">
            Nao enfrente o plantao sozinho. Tenha respaldo para decidir.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg gap-2">
              Quero Entrar para o A.G.I.R. Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">A</span>
                </div>
                <span className="text-2xl font-bold font-serif">A.G.I.R.</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Abdome Agudo Guiado por Investigacao e Raciocinio. Programa de formacao medica para atendimento seguro do abdome agudo.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Programa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#metodo" onClick={(e) => scrollToSection(e, 'metodo')} className="hover:text-foreground transition-colors cursor-pointer">Metodo A.G.I.R.</a></li>
                <li><a href="#conteudo" onClick={(e) => scrollToSection(e, 'conteudo')} className="hover:text-foreground transition-colors cursor-pointer">Conteudo</a></li>
                <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-foreground transition-colors cursor-pointer">Investimento</a></li>
                <li><a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-foreground transition-colors cursor-pointer">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Politica de Privacidade</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Conta</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Criar Conta</Link></li>
                <li><Link href="/forgot-password" className="hover:text-foreground transition-colors">Esqueci a Senha</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 A.G.I.R. - Programa de Formacao Medica. Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Conteudo educacional baseado em evidencias cientificas.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
