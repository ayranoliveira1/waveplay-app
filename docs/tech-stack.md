# WavePlay Mobile — Tech Stack

## Runtime & Linguagem

| Tech | Versao | Uso |
|------|--------|-----|
| React Native | 0.83.4 | Framework mobile |
| Expo SDK | 55 | Plataforma de build e servicos nativos |
| TypeScript | ~5.9.2 | Linguagem |
| React | 19.2.0 | Biblioteca de UI |
| pnpm | 10.x | Gerenciador de pacotes |

---

## Navegacao

| Tech | Versao | Uso |
|------|--------|-----|
| @react-navigation/native | ^7.2.2 | Core de navegacao |
| @react-navigation/native-stack | ^7.14.10 | Stack navigator (telas empilhadas) |
| @react-navigation/bottom-tabs | ^7.15.9 | Tab navigator (barra inferior) |
| react-native-screens | ^4.23.0 | Telas nativas otimizadas |
| react-native-safe-area-context | ^5.6.2 | Safe area (notch, barra de status) |

---

## Estado & Data Fetching

| Tech | Versao | Uso |
|------|--------|-----|
| @tanstack/react-query | ^5.95.2 | Cache de servidor, fetching, invalidacao |
| React Context | built-in | Estado global (auth, perfil ativo) |

---

## Estilizacao

| Tech | Versao | Uso |
|------|--------|-----|
| NativeWind (uniwind) | ^1.6.1 | Tailwind CSS para React Native |
| tailwindcss | ^4.2.2 | Engine de classes utilitarias |

---

## Formularios & Validacao

| Tech | Versao | Uso |
|------|--------|-----|
| react-hook-form | ^7.72.0 | Gerenciamento de formularios |
| @hookform/resolvers | ^5.2.2 | Integracao com Zod |
| zod | ^4.3.6 | Validacao de schemas (login, register, perfil) |

---

## UI & Midia

| Tech | Versao | Uso |
|------|--------|-----|
| expo-image | ^55.0.6 | Carregamento otimizado de imagens |
| expo-linear-gradient | ^55.0.9 | Gradientes (backdrop, hero banner) |
| react-native-svg | ^15.15.3 | Icones SVG |
| @expo/vector-icons (Ionicons) | built-in | Icones do sistema |
| react-native-webview | ^13.16.0 | Player de video (EmbedPlay) |

---

## Seguranca & Storage

| Tech | Versao | Uso |
|------|--------|-----|
| expo-secure-store | ^55.0.11 | Armazenamento seguro de tokens (Keychain/Keystore) |
| @react-native-async-storage/async-storage | ^2.2.0 | Storage local (historico de busca) |

---

## Infra & Deploy

| Tech | Versao | Uso |
|------|--------|-----|
| expo-updates | ~55.0.16 | Atualizacoes OTA (over-the-air) |
| expo-status-bar | ~55.0.4 | Controle da barra de status |
| expo-system-ui | ^55.0.11 | Configuracao de UI do sistema |
| EAS Build | cloud | Build nativo (Android APK/AAB, iOS IPA) |

---

## Dev & Tooling

| Tech | Versao | Uso |
|------|--------|-----|
| eslint | ^10.1.0 | Linting |
| @typescript-eslint/eslint-plugin | ^8.57.2 | Regras TypeScript para ESLint |
| @typescript-eslint/parser | ^8.57.2 | Parser TypeScript para ESLint |
| eslint-plugin-react | ^7.37.5 | Regras React |
| eslint-plugin-react-hooks | ^7.0.1 | Regras de hooks |
| eslint-plugin-import | ^2.32.0 | Ordem de imports |
| eslint-config-prettier | ^10.1.8 | Desativa regras conflitantes com Prettier |
| prettier | ^3.8.1 | Formatacao de codigo |

---

## Variaveis de Ambiente

```env
# API
EXPO_PUBLIC_API_BASE_URL=http://localhost:3333

# TMDB Images (CDN publica, sem token)
EXPO_PUBLIC_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

# Player
EXPO_PUBLIC_EMBED_PLAY_BASE_URL=https://embedplay.example.com
```

> **Nota:** O token do TMDB fica apenas no backend. O app acessa imagens via CDN publica e o catalogo via proxy da API.

---

## Scripts

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "lint": "eslint src/",
  "lint:fix": "eslint src/ --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx}\" \"App.tsx\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx}\" \"App.tsx\""
}
```
