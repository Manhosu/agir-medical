import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Suporte - A.G.I.R.',
  description: 'Central de Suporte do Programa A.G.I.R. - tire suas dúvidas sobre o app, assinatura e conta.',
}

export default function SuportePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-circular-white.png"
              alt="A.G.I.R."
              width={40}
              height={40}
              priority
            />
            <span className="text-lg font-semibold">A.G.I.R.</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Central de Suporte</h1>
        <p className="mb-12 text-lg text-muted-foreground">
          Estamos aqui para ajudar. Encontre respostas para as dúvidas mais comuns ou entre em
          contato direto com nossa equipe.
        </p>

        <div className="mb-12 rounded-2xl border border-border bg-card p-8">
          <h2 className="mb-4 text-2xl font-semibold">Contato direto</h2>
          <p className="mb-4 text-muted-foreground">
            Para qualquer dúvida, problema técnico ou solicitação relacionada à sua conta, envie
            um email:
          </p>
          <a
            href="mailto:franciscodazzi@hotmail.com"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90"
          >
            franciscodazzi@hotmail.com
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            Respondemos em até 48 horas úteis.
          </p>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-semibold">Perguntas frequentes</h2>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">Como faço meu cadastro?</h3>
            <p className="text-muted-foreground">
              O cadastro é feito exclusivamente pelo nosso site,{' '}
              <Link href="/" className="text-primary hover:underline">
                programa-agir.com.br
              </Link>
              . Após criar sua conta e contratar o plano, você poderá acessar o conteúdo pelo
              site ou pelo aplicativo iOS/Android usando o mesmo email.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">Como acesso o app no celular?</h3>
            <p className="text-muted-foreground">
              Após se cadastrar no site, baixe o aplicativo na App Store ou Google Play. Faça
              login com o mesmo email cadastrado e um código de acesso será enviado por email
              para você entrar no app.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">Não recebi o código de acesso por email</h3>
            <p className="text-muted-foreground">
              Verifique sua caixa de spam ou lixo eletrônico. Se ainda assim não chegar, aguarde
              alguns minutos e tente novamente. O código tem validade limitada — se expirar,
              basta solicitar um novo. Persistindo o problema, entre em contato pelo email
              acima.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">Como cancelo minha assinatura?</h3>
            <p className="text-muted-foreground">
              Para cancelar sua assinatura, envie um email para{' '}
              <a href="mailto:franciscodazzi@hotmail.com" className="text-primary hover:underline">
                franciscodazzi@hotmail.com
              </a>{' '}
              com o assunto &quot;Cancelar Assinatura&quot;. Após o cancelamento, seu acesso
              permanecerá ativo até o fim do período já pago.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">Como excluo minha conta?</h3>
            <p className="text-muted-foreground">
              Você pode excluir sua conta diretamente pelo aplicativo: vá em{' '}
              <strong>Perfil → Conta → Excluir Conta</strong>. A exclusão é definitiva e remove
              todos os seus dados de forma permanente. Alternativamente, envie um email para o
              endereço de suporte solicitando a exclusão.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">
              Preciso de ajuda com o conteúdo do curso
            </h3>
            <p className="text-muted-foreground">
              Para dúvidas sobre o conteúdo, casos clínicos ou diretrizes apresentadas no curso,
              entre em contato pelo email de suporte e um membro da equipe técnica responderá.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">Política de privacidade</h3>
            <p className="text-muted-foreground">
              Levamos sua privacidade a sério. Não compartilhamos seus dados com terceiros e
              utilizamos suas informações exclusivamente para fornecer o serviço contratado. Para
              mais informações ou para solicitar a exclusão de seus dados, entre em contato pelo
              email de suporte.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Programa A.G.I.R. — Todos os direitos reservados
        </div>
      </footer>
    </main>
  )
}
