import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionCard } from "@/components/SectionCard";
import { InfoList } from "@/components/InfoList";
import { StatCard } from "@/components/StatCard";
import { TableOfContents } from "@/components/TableOfContents";
import { Activity, Stethoscope, AlertTriangle, Heart, ClipboardList, Pill, BookOpen, FileCheck } from "lucide-react";
import criteriosLyonImage from "@/assets/criterios-lyon.png";
const tocItems = [{
  id: "epidemiologia",
  label: "1. Epidemiologia"
}, {
  id: "definicoes",
  label: "2. Definições"
}, {
  id: "fisiopatologia",
  label: "3. Fisiopatologia"
}, {
  id: "sintomas",
  label: "4. Manifestações Clínicas"
}, {
  id: "diagnostico",
  label: "5. Diagnóstico"
}, {
  id: "lyon",
  label: "6. Critérios de Lyon"
}, {
  id: "tratamento",
  label: "7. Tratamento"
}];
const Index = () => {
  return <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <TableOfContents items={tocItems} />
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Epidemiologia */}
            <SectionCard id="epidemiologia" title="Epidemiologia" icon={Activity}>
              <p className="text-muted-foreground mb-6">
                A Doença do Refluxo Gastroesofágico apresenta elevada demanda ambulatorial, 
                impactando significativamente a qualidade de vida dos pacientes.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard value="8–33%" label="Prevalência mundial" />
                <StatCard value="12–20%" label="Prevalência Brasil" />
                <StatCard value="4,5–5,4" label="Casos novos/1.000 hab/ano" />
                <StatCard value="50%" label="Acurácia diagnóstica" />
              </div>
              
              <div className="bg-accent/30 rounded-lg p-4 border border-border">
                <h4 className="font-medium text-foreground mb-2">Comparativo com outras condições:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diabetes Mellitus:</span>
                    <span className="font-medium text-foreground">10,2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hipertensão Arterial:</span>
                    <span className="font-medium text-foreground">27,9%</span>
                  </div>
                </div>
              </div>
            </SectionCard>
            
            {/* Definições */}
            <SectionCard id="definicoes" title="Definições" icon={BookOpen}>
              <div className="space-y-6">
                <div className="bg-accent/30 rounded-lg p-5 border-l-4 border-primary">
                  <h4 className="font-semibold text-foreground mb-2">Consenso de Montreal (2006)</h4>
                  <p className="text-muted-foreground italic">
                    "Condição que ocorre quando o refluxo do conteúdo gástrico causa sintomas 
                    incômodos e/ou complicações."
                  </p>
                </div>
                
                <div className="bg-accent/30 rounded-lg p-5 border-l-4 border-secondary">
                  <h4 className="font-semibold text-foreground mb-2">Consenso Brasileiro</h4>
                  <p className="text-muted-foreground italic">
                    "Afecção relacionada ao refluxo crônico do material gastroduodenal para o 
                    esôfago e/ou órgãos adjacentes, com ou sem lesão tecidual."
                  </p>
                </div>
                
                <div className="bg-secondary/20 rounded-lg p-5 border border-border/50">
                  <h4 className="font-semibold text-foreground mb-2">Refluxo Gastroesofágico Fisiológico</h4>
                  <p className="text-muted-foreground italic mb-4 text-base">
                    É o retorno espontâneo do conteúdo do estômago para o esôfago
                  </p>
                  <p className="text-muted-foreground text-sm font-medium mb-3">Presente em indivíduos saudáveis:</p>
                  <InfoList items={["Até 50 episódios/dia", "Duração limitada (≈ 4% do tempo em 24h)", "Pequeno volume", "Atinge no máximo o terço médio do esôfago", "Assintomático e sem lesão tecidual"]} />
                </div>
              </div>
            </SectionCard>
            
            {/* Fisiopatologia */}
            <SectionCard id="fisiopatologia" title="Fisiopatologia" icon={Heart}>
              <p className="text-muted-foreground mb-4">
                A DRGE envolve fatores esofágicos, gástricos e principalmente da junção esôfago-gástrica.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Barreiras Fisiológicas</h4>
                  <InfoList items={["Esfíncter Esofagiano Inferior (EEI)", "Crura diafragmática", "Segmento esofagiano intra-abdominal", "Membrana frenoesofágica", "Peristalse esofágica", "Clareamento esofágico (saliva + gravidade)"]} />
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Determinantes da Lesão</h4>
                  <InfoList items={["Quantidade de ácido refluído", "Tempo de exposição ácida", "Resistência da mucosa esofágica", "Sensibilidade esofágica"]} />
                </div>
              </div>
              
              <div className="mt-6 bg-destructive/10 rounded-lg p-4 border border-destructive/20">
                <p className="text-sm text-foreground">
                  <strong>⚠️ Importante:</strong> A interrupção do tratamento resulta em 
                  recorrência das lesões em até <strong>80%</strong> dos casos.
                </p>
              </div>
            </SectionCard>
            
            {/* Manifestações Clínicas */}
            <SectionCard id="sintomas" title="Manifestações Clínicas" icon={AlertTriangle}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/5 rounded-lg p-5 border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Sintomas Típicos (Esofágicos)
                  </h4>
                  <InfoList items={["Pirose (queimação retroesternal)", "Regurgitação"]} />
                </div>
                
                <div className="bg-secondary/5 rounded-lg p-5 border border-secondary/20">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Sintomas Atípicos (Extraesofágicos)
                  </h4>
                  <InfoList items={["Dor torácica não cardíaca", "Rouquidão, pigarro, globus", "Laringite, faringite", "Erosão dentária", "Tosse crônica, asma"]} />
                </div>
              </div>
              
              <div className="mt-6 bg-accent/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Apenas 40% dos pacientes com sintomas respiratórios e 20% dos pacientes manifestações otorrinolaringológicas apresentam sintomas típicos de DRGE.
                </p>
              </div>
            </SectionCard>
            
            {/* Diagnóstico */}
            <SectionCard id="diagnostico" title="Exames Complementares" icon={Stethoscope}>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Endoscopia Digestiva Alta</h4>
                    <p className="text-sm text-muted-foreground">
                      60% dos pacientes com sintomas típicos apresentam EDA normal. 
                      Esofagite erosiva em ≈35%.
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">pHmetria Esofágica</h4>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold text-primary">Padrão ouro</span> para diagnóstico. AET &gt;6% confirma DRGE; &lt;4% exclui DRGE.
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Impedâncio-pHmetria</h4>
                    <p className="text-sm text-muted-foreground">
                      Avalia refluxo ácido, não ácido e gasoso. Permite correlação sintoma-refluxo.
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Manometria Esofágica</h4>
                    <p className="text-sm text-muted-foreground">
                      Avalia distúrbios motores. Obrigatória antes de cirurgia antirrefluxo.
                    </p>
                  </div>
                </div>
                
                <div className="bg-accent/30 rounded-lg p-5">
                  <h4 className="font-semibold text-foreground mb-3">Scores Diagnósticos Validados</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-foreground">Score de Lyon:</span>
                      <span className="text-muted-foreground ml-2">Avalia as consequências do refluxo</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Score de Milão:</span>
                      <span className="text-muted-foreground ml-2">Avalia falhas da barreira antirrefluxo</span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
            
            {/* Critérios de Lyon */}
            <SectionCard id="lyon" title="Critérios de Lyon" icon={FileCheck}>
              <p className="text-muted-foreground mb-4">
                O Consenso de Lyon estabelece critérios para classificar a evidência de refluxo patológico, 
                diferenciando DRGE comprovada de não comprovada.
              </p>
              
              <div className="rounded-lg overflow-hidden border border-border">
                <img 
                  src={criteriosLyonImage} 
                  alt="Critérios de Lyon - Classificação de evidência para refluxo patológico"
                  className="w-full h-auto"
                />
              </div>
              
              <div className="mt-4 bg-accent/30 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Legenda:</strong> AET = Tempo de exposição ácida total | DIS = Dilatação dos espaços intercelulares | 
                  MNBI = Média noturna basal da impedância | MEI = Motilidade esofágica ineficaz | JEG = Junção esofagogástrica
                </p>
              </div>
            </SectionCard>
            
            {/* Tratamento */}
            <SectionCard id="tratamento" title="Tratamento" icon={Pill}>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Objetivos do Tratamento</h4>
                  <InfoList variant="numbered" items={["Controle dos sintomas", "Cicatrização da mucosa", "Manutenção da remissão", "Prevenção de complicações"]} />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-primary/5 rounded-lg p-5 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-3">Tratamento Clínico</h4>
                    <InfoList items={["Medidas comportamentais", "IBPs (8 semanas; dose dobrada em casos selecionados)", "PCABs (Vonoprazana)", "Alginatos", "Neuromoduladores nos fenótipos funcionais"]} />
                  </div>
                  
                  <div className="bg-secondary/5 rounded-lg p-5 border border-secondary/20">
                    <h4 className="font-semibold text-foreground mb-3">Indicações Cirúrgicas</h4>
                    <InfoList items={["Esofagite grave", "Barrett longo", "Hérnia de hiato sintomática", "Estenose péptica", "Refratariedade clínica", "Preferência do paciente"]} />
                  </div>
                </div>
                
                <div className="bg-accent/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Melhores resultados cirúrgicos:</strong> Pacientes com sintomas 
                    típicos e boa resposta prévia aos IBPs.
                  </p>
                </div>
              </div>
            </SectionCard>
            
            {/* Conclusão */}
            <SectionCard id="conclusao" title="Conclusão" icon={ClipboardList}>
              <div className="bg-gradient-to-r from-primary/10 to-accent/30 rounded-lg p-6 border border-primary/20">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">A DRGE é uma doença prevalente, heterogênea e multifatorial.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">O diagnóstico clínico isolado é insuficiente.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">A correta fenotipagem orienta o tratamento individualizado.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-foreground">Exames funcionais são fundamentais para evitar erros diagnósticos e terapêuticos.</span>
                  </li>
                </ul>
              </div>
            </SectionCard>
            
          </div>
        </div>
      </div>
      
      <Footer />
    </main>;
};
export default Index;