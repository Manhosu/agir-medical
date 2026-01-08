# AGIR Mobile - E-Learning Medico

Aplicativo mobile React Native para a plataforma de e-learning AGIR.

## Pre-requisitos

- Node.js >= 18
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS, apenas macOS)
- JDK 17

## Instalacao

1. Instale as dependencias:
```bash
cd mobile
npm install
```

2. Para iOS (apenas macOS):
```bash
cd ios
pod install
cd ..
```

## Executando o App

### Android
```bash
npm run android
```

### iOS (apenas macOS)
```bash
npm run ios
```

### Metro Bundler
```bash
npm start
```

## Estrutura do Projeto

```
mobile/
├── src/
│   ├── components/     # Componentes reutilizaveis
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Bibliotecas (Supabase, Session)
│   ├── navigation/     # React Navigation
│   ├── screens/        # Telas do app
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript types
│   └── utils/          # Utilitarios
├── App.tsx             # Componente raiz
└── index.js            # Entry point
```

## Funcionalidades

- Login/Cadastro com Supabase Auth
- Controle de sessao unica (1 dispositivo por vez)
- Visualizacao de cursos e aulas
- Rastreamento de progresso
- Protecao de conteudo (watermark, bloqueio de captura)

## Configuracao do Supabase

O app usa as mesmas credenciais do Supabase que a versao web.
As configuracoes estao em `src/lib/supabase.ts`.

## Protecao de Conteudo

O app implementa varias camadas de protecao:
- Watermark com email do usuario
- Bloqueio de selecao de texto no WebView
- FLAG_SECURE no Android (requer modulo nativo)
- Bloqueio de screenshots e gravacao de tela

## Gerando Build

### Android (APK)
```bash
cd android
./gradlew assembleRelease
```

### Android (AAB para Play Store)
```bash
cd android
./gradlew bundleRelease
```

### iOS
Use o Xcode para gerar o build de producao.

## Tecnologias

- React Native 0.73
- React Navigation 6
- Supabase JS
- Zustand (state management)
- MMKV (storage seguro)
- WebView (renderizacao de conteudo)
