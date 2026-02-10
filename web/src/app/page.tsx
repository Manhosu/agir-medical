'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import Link from "next/link"
import Image from "next/image"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Shield,
  Brain,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HelpCircle,
  Activity,
  UserX,
  ClipboardCheck,
  BookOpen,
  Search,
  Target,
  GraduationCap,
  Building2,
  Users,
  FileSearch,
  Scale,
  ArrowRightLeft,
  MessageSquare,
  FileText,
  Pill,
  FileCheck,
  MessageCircle,
  Headphones,
  Sparkles,
  X,
  Check,
  CreditCard,
  Lock,
  Zap,
  Calendar
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

export default function Home() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Image
                src="/logo-horizontal-white.png"
                alt="A.G.I.R."
                width={160}
                height={45}
                className="h-10 w-auto"
                priority
              />
            </motion.div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="hero" size="sm">Inscreva-se</Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        <div className="absolute inset-0 bg-grid opacity-10" />

        {/* Animated orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/15 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-8"
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm text-muted-foreground">Programa de Formacao Medica</span>
            </motion.div>

            {/* Main headline with logo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 flex flex-col items-center"
            >
              <span className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">Programa</span>
              <Image
                src="/logo-horizontal-white.png"
                alt="A.G.I.R. - Abdome Agudo Guiado por Investigacao e Raciocinio"
                width={500}
                height={140}
                className="h-20 md:h-28 lg:h-32 w-auto"
                priority
              />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-primary/80 font-medium mb-4"
            >
              Abdome Agudo Guiado por Investigacao e Raciocinio
            </motion.p>

            {/* Value proposition */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            >
              Nao enfrente o plantao sozinho. Tenha respaldo para decidir,
              <span className="text-foreground font-medium"> mesmo nos plantoes sem cirurgiao.</span>
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="hero" size="xl" className="group">
                    Quero seguranca para decidir no plantao
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {[
                { icon: Brain, text: "Raciocinio Estruturado" },
                { icon: Shield, text: "Decisoes Seguras" },
                { icon: Stethoscope, text: "Pratica Real" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary))" }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border transition-colors"
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Problem Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Atender dor abdominal no pronto-socorro e{" "}
                <span className="text-primary">diferente de qualquer outro atendimento</span>
              </h2>
            </motion.div>

            {/* Problem cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid gap-4 mb-12"
            >
              {[
                { icon: HelpCircle, text: "Sintomas inespecificos" },
                { icon: Activity, text: "Diagnosticos que se sobrepoem" },
                { icon: Clock, text: "Pressao por decisoes rapidas" },
                { icon: AlertTriangle, text: "Medo de errar ou atrasar um diagnostico grave" },
                { icon: UserX, text: "Pouco suporte cirurgico na retaguarda" },
              ].map((problem, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group cursor-pointer"
                >
                  <motion.div
                    className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <problem.icon className="w-5 h-5 text-destructive" />
                  </motion.div>
                  <span className="text-lg text-foreground">{problem.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Pain statement */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              transition={{ duration: 0.6 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/20"
            >
              <p className="text-lg md:text-xl text-muted-foreground mb-4">
                A verdade e simples: o abdome agudo e uma das principais causas de{" "}
                <span className="text-destructive font-semibold">erro, inseguranca e estresse</span> no plantao medico.
              </p>
              <p className="text-foreground font-medium">
                E nao porque voce nao sabe medicina - mas porque ninguem te ensinou um metodo claro para decidir.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Method Section - 4 Pillars */}
      <section id="metodo" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
              Metodologia
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              O Metodo <span className="text-primary text-glow">A.G.I.R.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quatro pilares fundamentais que transformam completamente a forma como voce encara o abdome agudo.
            </p>
          </motion.div>

          {/* Pillars grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          >
            {[
              {
                letter: "A",
                title: "Avaliacao Estruturada",
                description: "Historia clinica dirigida, exame fisico com proposito e identificacao precoce de gravidade.",
                icon: ClipboardCheck,
              },
              {
                letter: "G",
                title: "Guiado por Evidencias",
                description: "Fluxos claros, prioridades bem definidas e decisoes fundamentadas.",
                icon: BookOpen,
              },
              {
                letter: "I",
                title: "Investigacao Inteligente",
                description: "Solicite apenas exames que impactam a conduta - e aprenda a interpreta-los corretamente.",
                icon: Search,
              },
              {
                letter: "R",
                title: "Raciocinio para Acao",
                description: "Classifique risco, tome decisoes seguras e encaminhe com informacoes relevantes.",
                icon: Target,
              },
            ].map((pillar, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative p-8 rounded-2xl bg-card border border-border group-hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <span className="font-display text-2xl font-bold text-primary">{pillar.letter}</span>
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">
                        {pillar.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {pillar.description}
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <pillar.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <p className="text-xl text-foreground font-medium">
              Esse metodo muda completamente a forma como voce encara o abdome agudo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-background to-card/50" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
                Publico-Alvo
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                Para quem e o <span className="text-primary">A.G.I.R.</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Este programa foi feito para quem esta na linha de frente.
              </p>
            </motion.div>

            {/* Audience cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-4 mb-12"
            >
              {[
                { icon: GraduationCap, text: "Estudantes em internato de medicina" },
                { icon: Stethoscope, text: "Recem-formados iniciando plantoes" },
                { icon: Users, text: "Medicos generalistas" },
                { icon: Building2, text: "Medicos de UPA e PS clinico" },
                { icon: Users, text: "Revalidantes" },
                { icon: Stethoscope, text: "Residentes de Clinica Medica, GO e Medicina de Familia" },
                { icon: Building2, text: "Profissionais que atuam em hospitais sem equipe de Cirurgia Geral" },
              ].map((audience, index) => (
                <motion.div
                  key={index}
                  variants={index % 2 === 0 ? fadeInLeft : fadeInRight}
                  whileHover={{ scale: 1.02, x: index % 2 === 0 ? 10 : -10 }}
                  className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-muted/50 transition-all duration-300 cursor-pointer"
                >
                  <motion.div
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                    whileHover={{ scale: 1.2 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </motion.div>
                  <span className="text-foreground">{audience.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Highlight box */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center"
            >
              <p className="text-xl md:text-2xl text-foreground font-medium">
                Se voce atende dor abdominal e sente inseguranca,{" "}
                <span className="text-primary font-bold">o Programa A.G.I.R. e para voce.</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What You Learn Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
                Conteudo Programatico
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                O que voce vai <span className="text-primary">aprender</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Ao longo do programa, voce aprendera na pratica:
              </p>
            </motion.div>

            {/* Learning grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid gap-4 mb-12"
            >
              {[
                { icon: Brain, text: "Como estruturar o raciocinio clinico desde a anamnese" },
                { icon: AlertTriangle, text: "Quais sinais de alerta realmente mudam conduta" },
                { icon: FileSearch, text: "Quais exames solicitar - e quais evitar" },
                { icon: Scale, text: "Como classificar gravidade e risco" },
                { icon: ArrowRightLeft, text: "Quando observar, quando estabilizar e quando encaminhar" },
                { icon: MessageSquare, text: "Como organizar e apresentar um caso ao cirurgiao" },
                { icon: FileText, text: "Prescricoes objetivas e aplicaveis ao plantao real" },
              ].map((learning, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer"
                  >
                    <motion.div
                      className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <learning.icon className="w-5 h-5 text-accent" />
                    </motion.div>
                    <span className="text-lg text-foreground">{learning.text}</span>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="ml-auto"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Focus statement */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center"
            >
              <p className="text-xl text-foreground font-medium p-6 rounded-2xl bg-card border border-border inline-block">
                Tudo com foco no que realmente importa na <span className="text-primary">vida real</span>.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Differentials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
                Diferenciais
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                Por que o A.G.I.R. e <span className="text-primary">diferente?</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Porque ele foi desenvolvido para a realidade do plantao - sem teoria excessiva,
                sem floreios, sem conteudos desconectados da pratica.
              </p>
            </motion.div>

            {/* Three pillars */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-6 mb-24"
            >
              {[
                {
                  icon: Brain,
                  title: "Raciocinio clinico estruturado",
                  description: "Aprenda a formular hipoteses diagnosticas coerentes, reconhecer padroes clinicos e entender quais dados realmente fazem diferenca.",
                },
                {
                  icon: FileCheck,
                  title: "Condutas claras e seguras",
                  description: "Saiba exatamente o que fazer diante de cada contexto: quais exames solicitar, quando observar, quando estabilizar, quando referenciar.",
                },
                {
                  icon: Pill,
                  title: "Prescricao orientada pela pratica",
                  description: "Indicacoes objetivas, protocolos aplicaveis e modelos de prescricao para a vida real - nao apenas para provas.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group"
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="h-full p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />

                    <div className="relative">
                      <motion.div
                        className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <item.icon className="w-7 h-7 text-primary" />
                      </motion.div>

                      <h3 className="font-display text-xl font-bold text-foreground mb-3">
                        {item.title}
                      </h3>

                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Beyond lessons section */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Muito alem das aulas
              </h3>
              <p className="text-muted-foreground">
                O A.G.I.R. e uma comunidade de formacao clinica continua.
              </p>
            </motion.div>

            {/* Extras grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              {[
                { icon: Users, text: "Grupo exclusivo no Telegram" },
                { icon: MessageCircle, text: "Discussao de casos clinicos reais" },
                { icon: BookOpen, text: "Atualizacoes cientificas recorrentes" },
                { icon: Headphones, text: "Suporte da equipe do programa" },
                { icon: Sparkles, text: "Suporte personalizado no Pacote Premium" },
              ].map((extra, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 text-center cursor-pointer"
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <extra.icon className="w-6 h-6 text-accent" />
                  </motion.div>
                  <span className="text-sm text-foreground font-medium">{extra.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
                Transformacao
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                Com o A.G.I.R., voce <span className="text-primary">transforma</span> sua pratica
              </h2>
            </motion.div>

            {/* Before/After comparison */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Before */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInLeft}
                className="p-8 rounded-2xl bg-destructive/5 border border-destructive/20"
              >
                <h3 className="font-display text-xl font-bold text-destructive mb-6 flex items-center gap-2">
                  <X className="w-6 h-6" />
                  Voce deixa de...
                </h3>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  {["Improvisar", "Atender com medo", "Encaminhar sem seguranca"].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInLeft}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                        <X className="w-4 h-4 text-destructive" />
                      </div>
                      <span className="text-muted-foreground line-through">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* After */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInRight}
                className="p-8 rounded-2xl bg-primary/5 border border-primary/20"
              >
                <h3 className="font-display text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Check className="w-6 h-6" />
                  E passa a...
                </h3>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  {["Decidir com metodo", "Atender com clareza", "Agir com confianca"].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInRight}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Check className="w-4 h-4 text-primary" />
                      </motion.div>
                      <span className="text-foreground font-medium">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* Statement */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center"
            >
              <p className="text-xl md:text-2xl text-muted-foreground mb-6">
                A dor abdominal e o abdome agudo <span className="text-foreground font-semibold">nao permitem improviso.</span>
              </p>
              <p className="text-lg text-foreground mb-8">
                Exigem <span className="text-primary font-bold">metodo</span>, <span className="text-primary font-bold">raciocinio</span> e <span className="text-primary font-bold">decisao responsavel</span>.
              </p>

              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="hero" size="xl" className="group">
                    Quero decidir com metodo e confianca
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-background to-card/50" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
                Duvidas
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                Perguntas <span className="text-primary">Frequentes</span>
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {[
                  {
                    question: "Para quem e o Programa A.G.I.R.?",
                    answer: "O A.G.I.R. foi desenvolvido para medicos e estudantes que atuam na linha de frente do atendimento a dor abdominal e ao abdome agudo, especialmente em cenarios sem suporte cirurgico imediato.",
                  },
                  {
                    question: "O curso e teorico ou pratico?",
                    answer: "O A.G.I.R. e essencialmente pratico. Todo o conteudo e orientado para a realidade do plantao, com foco em raciocinio clinico estruturado, condutas claras, prescricao aplicavel e tomada de decisao responsavel.",
                  },
                  {
                    question: "O conteudo serve para quem trabalha em UPA ou hospital sem cirurgiao?",
                    answer: "Sim. Esse e um dos principais focos do programa. O Programa A.G.I.R. foi criado justamente para capacitar profissionais que atendem em locais sem retaguarda cirurgica imediata.",
                  },
                  {
                    question: "Vou conseguir aplicar o conteudo no proximo plantao?",
                    answer: "Sim. O metodo A.G.I.R. e estruturado para aplicacao imediata. As aulas sao curtas, objetivas e baseadas em situacoes reais.",
                  },
                  {
                    question: "O programa ensina quando encaminhar para a Cirurgia Geral?",
                    answer: "Sim. Um dos pilares do Programa A.G.I.R. e o raciocinio para acao. Voce aprendera a classificar risco, identificar sinais de gravidade e decidir o momento correto do encaminhamento.",
                  },
                  {
                    question: "Por quanto tempo terei acesso ao conteudo?",
                    answer: "Ao entrar no Programa A.G.I.R., voce garante 12 meses de acesso completo, incluindo todo o conteudo atual, atualizacoes continuas e novas integracoes.",
                  },
                ].map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-border rounded-xl px-6 bg-card data-[state=open]:border-primary/30 transition-colors"
                  >
                    <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary transition-colors py-5 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />

        {/* Animated orbs */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="text-center"
            >
              {/* Main CTA box */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-12 rounded-3xl bg-card/80 backdrop-blur-sm border border-primary/30 glow-primary"
              >
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                  Nao quero mais improvisar na{" "}
                  <motion.span
                    className="text-primary"
                    animate={{ textShadow: ["0 0 10px hsl(150 97% 27% / 0.5)", "0 0 30px hsl(150 97% 27% / 0.8)", "0 0 10px hsl(150 97% 27% / 0.5)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    dor abdominal
                  </motion.span>
                </h2>

                <p className="text-xl text-muted-foreground mb-10">
                  Aprenda a avaliar, investigar e agir com metodo, a partir do proximo plantao.
                </p>

                {/* CTA Button */}
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block mb-10"
                  >
                    <Button variant="hero" size="xl" className="group">
                      Garantir minha vaga no A.G.I.R.
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </Button>
                  </motion.div>
                </Link>

                {/* Benefits */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto"
                >
                  {[
                    { icon: CreditCard, text: "Parcelamento em ate 12x" },
                    { icon: Lock, text: "Pagamento seguro" },
                    { icon: Zap, text: "Acesso imediato apos confirmacao" },
                    { icon: Calendar, text: "Conteudo aplicavel desde o proximo plantao" },
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <benefit.icon className="w-5 h-5 text-primary shrink-0" />
                      <span>{benefit.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-12 border-t border-border bg-card/50"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <Image
                src="/logo-horizontal-white.png"
                alt="A.G.I.R. - Abdome Agudo Guiado por Investigacao e Raciocinio"
                width={200}
                height={56}
                className="h-12 w-auto"
              />
            </motion.div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Criar Conta</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Termos</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground text-center">
              &copy; {new Date().getFullYear()} Programa A.G.I.R. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </motion.footer>
    </main>
  )
}
