import heroImage from "@/assets/hero-drge.jpg";

export function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Hero Image Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Ilustração do sistema digestivo - esôfago e estômago"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
            Guia Médico Educacional
          </span>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground font-serif mb-6 leading-tight">
            Doença do Refluxo<br />
            <span className="text-primary">Gastroesofágico</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Uma das condições mais prevalentes na prática clínica de gastroenterologistas. 
            Guia completo sobre epidemiologia, fisiopatologia, diagnóstico e tratamento.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#epidemiologia"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Explorar Conteúdo
            </a>
            <a 
              href="#diagnostico"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-card border border-border text-foreground font-medium hover:bg-accent transition-colors"
            >
              Ver Diagnóstico
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
