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
  RefreshCw
} from "lucide-react"

const tocItems = [
  { id: 'features', label: '1. Recursos' },
  { id: 'content', label: '2. Conteúdo' },
  { id: 'mobile-app', label: '3. App Mobile' },
  { id: 'how-it-works', label: '4. Como Funciona' },
  { id: 'benefits', label: '5. Benefícios' },
  { id: 'pricing', label: '6. Preços' },
  { id: 'testimonials', label: '7. Depoimentos' },
  { id: 'faq', label: '8. FAQ' },
]

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>('')
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll spy - detect current section and show/hide TOC
  useEffect(() => {
    const handleScroll = () => {
      // Show TOC when scrolling
      setIsScrolling(true)

      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Hide TOC after 1.5 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 1500)

      // Update active section
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
    handleScroll() // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Fast smooth scroll
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
            <span className="text-2xl font-bold text-foreground font-serif">AGIR</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Recursos
            </a>
            <a
              href="#content"
              onClick={(e) => scrollToSection(e, 'content')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Conteúdo
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Preços
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
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Floating Table of Contents - Desktop Only - Shows on scroll */}
      <aside
        className={`hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 z-40 transition-opacity duration-300 ${
          isScrolling ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Índice
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
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/50 via-background to-background" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
              <Stethoscope className="w-4 h-4" />
              Plataforma de E-Learning Médico
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground font-serif mb-6 leading-tight">
              Guidelines Médicos<br />
              <span className="text-primary">Atualizados e Acessíveis</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Acesse os principais guidelines de gastroenterologia e emergência médica.
              Conteúdo elaborado por especialistas, formatado para estudo eficiente
              e disponível em qualquer dispositivo.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" className="px-8 h-14 text-lg gap-2">
                  <Play className="w-5 h-5" />
                  Começar Agora
                </Button>
              </Link>
              <a
                href="#content"
                onClick={(e) => scrollToSection(e, 'content')}
                className="cursor-pointer"
              >
                <Button size="lg" variant="outline" className="px-8 h-14 text-lg gap-2">
                  Ver Conteúdo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Conteúdo Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                <span className="text-sm">Atualizado Constantemente</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm">Por Especialistas</span>
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
              <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">20+</div>
              <div className="text-muted-foreground">Guidelines Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">100%</div>
              <div className="text-muted-foreground">Baseado em Evidências</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">24/7</div>
              <div className="text-muted-foreground">Acesso Ilimitado</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary font-serif mb-2">Web+App</div>
              <div className="text-muted-foreground">Multiplataforma</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">RECURSOS</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Por que escolher o AGIR?
            </h2>
            <p className="text-muted-foreground text-lg">
              Uma plataforma completa para médicos e residentes que buscam
              excelência em conhecimento clínico.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Conteúdo Premium</CardTitle>
                <CardDescription>
                  Guidelines e protocolos atualizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acesse os principais guidelines de gastroenterologia e emergência,
                  com conteúdo revisado por especialistas e formatado para fácil leitura.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Multiplataforma</CardTitle>
                <CardDescription>
                  Web e Mobile sincronizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acesse de qualquer dispositivo com sincronização em tempo real.
                  Seu progresso de leitura sempre atualizado entre web e app.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <LockKeyhole className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Seguro e Protegido</CardTitle>
                <CardDescription>
                  Conteúdo exclusivo para assinantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistema de proteção avançado com watermark personalizado.
                  Seu acesso é único e seguro.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Progresso Rastreado</CardTitle>
                <CardDescription>
                  Acompanhe sua evolução
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dashboard personalizado mostrando seu progresso em cada guideline.
                  Saiba exatamente onde parou e quanto falta.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Leitura Otimizada</CardTitle>
                <CardDescription>
                  Dark mode e tipografia premium
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface projetada para longas sessões de estudo.
                  Modo escuro e claro com tipografia que reduz a fadiga visual.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Sempre Atualizado</CardTitle>
                <CardDescription>
                  Conteúdo revisado periodicamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Guidelines atualizados conforme novos consensos são publicados.
                  Você sempre terá acesso à informação mais recente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Content Preview Section */}
      <section id="content" className="py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">CONTEÚDO</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Guidelines Disponíveis
            </h2>
            <p className="text-muted-foreground text-lg">
              Mais de 20 guidelines de emergência e gastroenterologia,
              prontos para estudo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Apendicite Aguda",
              "Pancreatite Aguda",
              "Colecistite Aguda",
              "Colangite Aguda",
              "Diverticulite Aguda",
              "Abdome Agudo Obstrutivo",
              "Abdome Agudo Perfurativo",
              "Isquemia Mesentérica",
              "DRGE",
              "Hérnia Inguinal",
              "Hérnia Umbilical",
              "Volvo de Sigmoide",
              "Síndrome de Ogilvie",
              "Abscesso Hepático",
              "Linfadenite Mesentérica",
              "Ureterolitíase"
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
                Acessar Todos os Guidelines
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section id="mobile-app" className="py-24 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <span className="text-primary font-medium mb-4 block">APP MOBILE</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
                Estude onde estiver com nosso app
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Disponível para iPhone e Android. Tenha todos os guidelines na palma da sua mão,
                com sincronização automática em tempo real.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { title: 'Sincronização em tempo real', desc: 'Seu progresso sincroniza automaticamente entre web e app' },
                  { title: 'Proteção de conteúdo', desc: 'Conteúdo protegido com marca d\'água e bloqueio de cópia' },
                  { title: 'Notificações inteligentes', desc: 'Lembretes de estudo e novos conteúdos' },
                  { title: 'Interface otimizada', desc: 'Design pensado para telas menores' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-5 py-3 bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Baixar na</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-5 py-3 bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Disponível no</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </a>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                * Apps disponíveis em breve. Cadastre-se para ser notificado do lançamento.
              </p>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-64 md:w-72 bg-foreground rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-background rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-card px-6 py-2 flex justify-between items-center text-xs">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-foreground rounded-sm">
                          <div className="w-3/4 h-full bg-primary rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    {/* App Content Preview */}
                    <div className="p-4 space-y-4 h-[480px] md:h-[520px]">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Olá, Dr. Carlos</p>
                          <p className="font-semibold text-sm">Continue estudando</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                      </div>
                      {/* Progress Card */}
                      <div className="bg-card rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Apendicite Aguda</p>
                            <p className="text-xs text-muted-foreground">75% concluído</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-primary rounded-full"></div>
                        </div>
                      </div>
                      {/* Guidelines List */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">GUIDELINES</p>
                        {['Pancreatite Aguda', 'Colecistite Aguda', 'DRGE'].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -z-10 top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="absolute -z-10 bottom-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">COMO FUNCIONA</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Comece em 3 passos simples
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 font-serif">Crie sua conta</h3>
              <p className="text-muted-foreground">
                Cadastre-se gratuitamente em menos de 1 minuto com seu email.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 font-serif">Escolha seu plano</h3>
              <p className="text-muted-foreground">
                Selecione a assinatura anual e tenha acesso a todo o conteúdo.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 font-serif">Comece a estudar</h3>
              <p className="text-muted-foreground">
                Acesse os guidelines de qualquer dispositivo e acompanhe seu progresso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Doctors */}
      <section id="benefits" className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-medium mb-4 block">PARA MÉDICOS</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
                Otimize seu tempo de estudo
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Sabemos que a rotina médica é intensa. Por isso, criamos uma plataforma
                que permite estudar de forma eficiente, em qualquer lugar.
              </p>

              <div className="space-y-4">
                {[
                  "Conteúdo organizado por especialidade",
                  "Formatação otimizada para leitura rápida",
                  "Tabelas e fluxogramas de fácil consulta",
                  "Busca inteligente por tópicos",
                  "Marcadores de progresso automáticos",
                  "Acesso offline no app mobile"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Ideal para</h4>
                  <p className="text-sm text-muted-foreground">Residentes e especialistas</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <span className="font-medium">Residentes</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prepare-se para provas e plantões com conteúdo atualizado
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    <span className="font-medium">Emergencistas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consulta rápida durante atendimentos de urgência
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-medium">Especialistas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Atualização contínua baseada em consensos recentes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">PREÇOS</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Investimento no seu conhecimento
            </h2>
            <p className="text-muted-foreground text-lg">
              Um único plano com acesso completo a todos os guidelines.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  MAIS POPULAR
                </span>
              </div>
              <CardHeader className="text-center pb-0">
                <CardTitle className="text-2xl font-serif">Assinatura Anual</CardTitle>
                <CardDescription>Acesso completo por 12 meses</CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-8">
                <div className="mb-8">
                  <span className="text-5xl font-bold font-serif">R$ 297</span>
                  <span className="text-muted-foreground">/ano</span>
                </div>

                <div className="space-y-3 text-left mb-8">
                  {[
                    "Acesso a todos os 20+ guidelines",
                    "Web + App mobile",
                    "Sincronização em tempo real",
                    "Atualizações incluídas",
                    "Suporte por email",
                    "Cancelamento a qualquer momento"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/register" className="block">
                  <Button size="lg" className="w-full h-14 text-lg">
                    Assinar Agora
                  </Button>
                </Link>

                <p className="text-xs text-muted-foreground mt-4">
                  Pagamento seguro via cartão ou PIX
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">DEPOIMENTOS</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              O que dizem nossos usuários
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Carlos M.",
                role: "Residente de Cirurgia",
                text: "Fundamental para minha preparação nos plantões. Conteúdo direto ao ponto e bem organizado."
              },
              {
                name: "Dra. Ana Paula S.",
                role: "Emergencista",
                text: "Uso diariamente no pronto-socorro. A formatação facilita muito a consulta rápida durante os atendimentos."
              },
              {
                name: "Dr. Roberto L.",
                role: "Gastroenterologista",
                text: "Excelente material de atualização. Os guidelines estão sempre em dia com os consensos mais recentes."
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4">
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
                q: "Como funciona o acesso ao conteúdo?",
                a: "Após a assinatura, você terá acesso imediato a todos os guidelines pela web e pelo app mobile. O conteúdo fica disponível 24/7 durante todo o período da assinatura."
              },
              {
                q: "O conteúdo é atualizado?",
                a: "Sim! Atualizamos os guidelines sempre que novos consensos são publicados. Todas as atualizações estão incluídas na sua assinatura."
              },
              {
                q: "Posso acessar de múltiplos dispositivos?",
                a: "Sim, você pode acessar de qualquer dispositivo. Porém, por segurança, permitimos apenas uma sessão ativa por vez."
              },
              {
                q: "Como funciona o pagamento?",
                a: "Aceitamos cartão de crédito e PIX. O pagamento é anual e você pode cancelar a qualquer momento."
              },
              {
                q: "Tem app mobile?",
                a: "Sim! Temos aplicativos para Android e iOS com todas as funcionalidades de visualização da versão web, com sincronização em tempo real."
              },
              {
                q: "Posso compartilhar minha conta?",
                a: "Não. A assinatura é individual e intransferível. O conteúdo possui watermark com seus dados para proteção."
              }
            ].map((faq, index) => (
              <div key={index} className="p-6 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary-foreground mb-6">
            Pronto para elevar seu conhecimento?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-10">
            Junte-se a centenas de médicos que já utilizam o AGIR para se
            manterem atualizados com os principais guidelines.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg gap-2">
              Começar Agora
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
                <span className="text-2xl font-bold font-serif">AGIR</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Plataforma de e-learning médico com guidelines atualizados
                para profissionais de saúde.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-foreground transition-colors cursor-pointer">Recursos</a></li>
                <li><a href="#content" onClick={(e) => scrollToSection(e, 'content')} className="hover:text-foreground transition-colors cursor-pointer">Conteúdo</a></li>
                <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-foreground transition-colors cursor-pointer">Preços</a></li>
                <li><a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-foreground transition-colors cursor-pointer">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Política de Privacidade</Link></li>
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
              &copy; 2026 AGIR - E-Learning Médico. Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Material educacional baseado em consensos médicos atualizados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
