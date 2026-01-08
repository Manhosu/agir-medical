# Projeto: Ecossistema E-Learning Médico (Full Stack)

## 1. Descrição do Sistema
Este sistema é uma plataforma corporativa de E-Learning focada no público médico. O objetivo é a comercialização e consumo de cursos e guidelines técnicos através de um modelo de **assinatura anual recorrente**. 

O projeto consiste na migração de uma concepção inicial feita em **Lovable** para uma infraestrutura Full Stack profissional, escalável e de alta segurança.

## 2. Componentes do Ecossistema
* **Plataforma Web:** E-commerce de assinaturas e LMS (Learning Management System).
* **Aplicativo Móvel (Android/iOS):** Visualizador de conteúdo com sincronização em tempo real.
* **Painel Administrativo:** Gestão de usuários, conteúdos e relatórios financeiros.

## 3. Pilares Técnicos e Segurança (Lock-Down)

### A. Visualização de Conteúdo (HTML-Only)
* **Regra de Ouro:** O sistema **não** deve utilizar leitores de PDF padrão. 
* **Fluxo:** O PDF original (armazenado em servidor privado) deve ser processado e renderizado para o usuário final em formato **HTML/Canvas**.
* **Proteção:** O visualizador deve impedir seleção de texto, clique direito, "Salvar como" e atalhos de impressão.
* **Watermark Dinâmica:** Injetar o E-mail ou CPF do aluno logado sobre o conteúdo renderizado para desestimular capturas de tela.

### B. Gestão de Acesso e Assinaturas
* **Modelo de Negócio:** Assinatura anual com recorrência automática.
* **Gateways:** Integração com Cartão de Crédito e PIX (ex: Stripe ou ASAAS).
* **Single Session Control:** Controle rigoroso de sessão única. Se o usuário abrir em um novo dispositivo, a sessão anterior deve ser derrubada automaticamente para evitar compartilhamento de contas.
* **Conexão Ativa:** O conteúdo não deve ser armazenado em cache local (offline). Exige-se conexão para descriptografia e renderização em tempo real.

## 4. Requisitos de Funcionalidades

### Usuário (Aluno)
* Dashboard com progresso de leitura.
* Biblioteca de temas e aulas (Guidelines).
* Interface Premium com Dark/Light mode otimizados para leitura extensiva.
* Sincronização 100% entre progresso Web e Mobile.

### Administrador
* Gestão de usuários (Ativar/Bloquear/Renovar manualmente).
* Módulo de Upload: Subir novos PDFs que serão convertidos pelo sistema.
* Relatórios de vendas e saúde da base de assinantes.

## 5. Stack Tecnológica Alvo
* **Backend:** Node.js (TypeScript).
* **Frontend Web:** Next.js (Tailwind CSS).
* **Mobile:** React Native ou Flutter.
* **Banco de Dados:** PostgreSQL.
* **Storage:** Privado (AWS S3 ou similar) com acesso via Signed URLs.

todos os pdfs ja existentes estao na pasta pdfs