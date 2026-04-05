# WavePlay Mobile — Arquitetura

## Stack

- **Framework:** React Native (Expo SDK 55)
- **Linguagem:** TypeScript
- **Navegacao:** React Navigation (native-stack + bottom-tabs)
- **Estado server:** TanStack React Query
- **Estado local:** React Context (AuthContext, ProfileContext)
- **Estilizacao:** NativeWind (Tailwind CSS para React Native)
- **HTTP Client:** Fetch API com interceptor customizado (`services/api.ts`)
- **Storage seguro:** expo-secure-store (tokens)
- **Validacao:** Zod + React Hook Form

---

## Estrutura de Pastas

```
streams-tests/
├── App.tsx                        # Entry point (providers)
├── docs/                          # Documentacao do projeto
├── tasks/                         # Task files padronizados
│
├── src/
│   ├── global.css                 # Estilos globais (Tailwind)
│   │
│   ├── components/                # Componentes reutilizaveis
│   │   ├── AnimatedSection.tsx    # Wrapper com animacao de entrada
│   │   ├── BackButton.tsx         # Botao de voltar (absolute/inline)
│   │   ├── Carousel.tsx           # Lista horizontal genérica
│   │   ├── ContinueWatchingCard.tsx # Card de "Continue Assistindo"
│   │   ├── EpisodeCard.tsx        # Card de episodio com progresso
│   │   ├── GenreChips.tsx         # Chips de genero
│   │   ├── HeroBanner.tsx         # Banner principal da Home
│   │   ├── MediaCard.tsx          # Card de filme/serie (poster)
│   │   ├── RatingBadge.tsx        # Badge de avaliacao
│   │   ├── ScreenHeader.tsx       # Header padrao de tela
│   │   ├── SeasonPicker.tsx       # Seletor de temporada
│   │   ├── SessionKilledOverlay.tsx # Overlay quando sessao e encerrada
│   │   ├── StreamConflictModal.tsx  # Modal de conflito de telas
│   │   ├── SubscriptionBanner.tsx   # Banner de assinatura sobre backdrop
│   │   ├── index.ts               # Barrel export
│   │   └── ui/                    # Componentes UI primitivos
│   │       ├── Badge.tsx
│   │       ├── BottomSheetMenu.tsx
│   │       ├── Button.tsx
│   │       ├── Chip.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── Input.tsx
│   │       ├── Skeleton.tsx
│   │       ├── UpdateModal.tsx
│   │       └── index.ts
│   │
│   ├── constants/
│   │   ├── api.ts                 # URLs base (API, TMDB images, EmbedPlay)
│   │   └── theme.ts               # Cores de perfil, helpers visuais
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx         # Autenticacao (user, signIn, signOut)
│   │   └── ProfileContext.tsx      # Perfil ativo (selecao, CRUD)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts             # Acesso ao AuthContext
│   │   ├── useFavorites.ts        # CRUD favoritos (React Query)
│   │   ├── useHistory.ts          # Historico de reproducao
│   │   ├── useProgress.ts         # Progresso de reproducao + formatTime
│   │   ├── useProfile.ts          # Acesso ao ProfileContext
│   │   ├── useSearchHistory.ts    # Historico de buscas (AsyncStorage)
│   │   ├── useStream.ts           # Lifecycle de stream (start/ping/stop)
│   │   ├── useSubscription.ts     # Verificacao de assinatura ativa
│   │   ├── useWatchlist.ts        # CRUD watchlist (React Query)
│   │   └── index.ts               # Barrel export
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx       # Root navigator (auth check + OTA update)
│   │   ├── AuthNavigator.tsx      # Stack: Login, Register, ForgotPassword
│   │   └── MainNavigator.tsx      # Bottom tabs: Home, Movies, Series, Profile
│   │
│   ├── screens/
│   │   ├── SplashScreen.tsx       # Tela de splash animada
│   │   ├── LoginScreen.tsx        # Login com email/senha
│   │   ├── RegisterScreen.tsx     # Registro de conta
│   │   ├── ForgotPasswordScreen.tsx # Reset de senha
│   │   ├── ProfileSelectionScreen.tsx # Selecao de perfil (estilo Netflix)
│   │   ├── ProfileFormScreen.tsx  # Criar/editar perfil
│   │   ├── HomeScreen.tsx         # Trending, carouseis, continue watching
│   │   ├── MoviesScreen.tsx       # Listas de filmes por categoria
│   │   ├── SeriesScreen.tsx       # Listas de series por categoria
│   │   ├── MovieDetailScreen.tsx  # Detalhe do filme + assistir
│   │   ├── SeriesDetailScreen.tsx # Detalhe da serie + episodios
│   │   ├── SearchScreen.tsx       # Busca no catalogo
│   │   ├── PlayerScreen.tsx       # WebView com player (EmbedPlay)
│   │   ├── ProfileScreen.tsx      # Menu do perfil (conta, favoritos, etc)
│   │   ├── AccountScreen.tsx      # Dados da conta + subscription
│   │   ├── PlansScreen.tsx        # Listagem de planos disponiveis
│   │   └── index.ts               # Barrel export
│   │
│   ├── services/
│   │   ├── api.ts                 # HTTP client com auto-refresh de token
│   │   ├── token-storage.ts       # SecureStore (refresh) + memoria (access)
│   │   ├── catalog.ts             # Endpoints de catalogo (filmes, series)
│   │   ├── library.ts             # Endpoints de favoritos e watchlist
│   │   ├── playback.ts            # Endpoints de progresso e historico
│   │   ├── stream.ts              # Endpoints de stream (start/ping/stop)
│   │   ├── plans.ts               # Endpoint de planos
│   │   └── embedplay.ts           # Gerador de URL do player
│   │
│   └── types/
│       ├── api.ts                 # Tipos do catalogo (Movie, Series, Episode, Plan, etc)
│       ├── api-response.ts        # ApiResponse<T>, UserData, UserSubscription
│       ├── navigation.ts          # RootStackParamList, AuthStackParamList, MainTabParamList
│       └── index.ts               # Barrel export
```

---

## Mapa de Navegacao

```
AppNavigator (root)
├── [!authenticated] AuthNavigator (stack)
│   ├── Login
│   ├── Register
│   └── ForgotPassword
│
├── [authenticated, !activeProfile] ProfileSelection → ProfileForm
│
└── [authenticated, activeProfile] MainNavigator (bottom-tabs)
    ├── Home
    ├── Movies
    ├── Series
    └── Profile
    
    Stack screens (sobre as tabs):
    ├── MovieDetail
    ├── SeriesDetail
    ├── Search
    ├── Player
    ├── ProfileSelection
    ├── ProfileForm
    ├── Account
    └── Plans
```

---

## Fluxo de Dados

```
Screen / Hook
    ↓
Service (api.ts — fetch com interceptor)
    ↓
API Backend (NestJS)
    ↓
Response: { success: boolean, data?: T, error?: E[] }
    ↓
React Query (cache, invalidacao, retry)
    ↓
UI (re-render automatico)
```

### Interceptor de Token (`services/api.ts`)

```
Request
  ↓
Adiciona Authorization: Bearer <accessToken> (da memoria)
  ↓
Se 401 → tenta refresh com refreshToken (do SecureStore)
  ├── Sucesso → salva novos tokens → retry do request original
  └── Falha → chama onUnauthorized() → logout
  ↓
Response tipado: ApiResponse<T>
```

---

## Estado Global

### AuthContext (`contexts/AuthContext.tsx`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `user` | `UserData \| null` | Dados do usuario logado (inclui subscription) |
| `isAuthenticated` | `boolean` | Se tem usuario |
| `isLoading` | `boolean` | Restaurando sessao |
| `signIn()` | `function` | Login (email + senha) |
| `signOut()` | `function` | Logout (limpa tokens) |

### ProfileContext (`contexts/ProfileContext.tsx`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `activeProfile` | `Profile \| null` | Perfil selecionado |
| `profiles` | `Profile[]` | Lista de perfis do usuario |
| `isLoading` | `boolean` | Carregando perfis |
| `selectProfile()` | `function` | Selecionar perfil ativo |
| `clearProfile()` | `function` | Limpar selecao |

---

## Comunicacao com Backend

O app consome a API WavePlay (NestJS) que segue DDD com bounded contexts:

| BC no Backend | Uso no App |
|---------------|------------|
| Identity | Login, registro, refresh token, forgot password |
| Profile | Selecao e CRUD de perfis |
| Catalog | Trending, listas, detalhes, busca (proxy TMDB) |
| Library | Favoritos e watchlist por perfil |
| Playback | Progresso e historico por perfil |
| Subscription | Planos disponiveis, controle de streams |

---

## Padrao de Response da API

Todas as rotas retornam:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Em caso de erro:

```json
{
  "success": false,
  "data": [],
  "error": [
    { "message": "Credenciais invalidas.", "path": ["email"] }
  ]
}
```

---

## Token Storage

### Mobile (React Native)

| Token | Storage | Motivo |
|-------|---------|--------|
| Access Token | `expo-secure-store` (Keychain/Keystore) | Protegido pelo SO, persiste entre sessoes |
| Refresh Token | `expo-secure-store` (Keychain/Keystore) | Longo (48h), protegido pelo SO |

### Web (Browser)

| Token | Storage | Motivo |
|-------|---------|--------|
| Access Token | Memoria (variavel JS) | Curto (15min), nunca em localStorage |
| Refresh Token | httpOnly cookie (Secure, SameSite=Strict) | Enviado automaticamente pelo browser |

---

## OTA Updates

O app usa `expo-updates` para atualizacoes OTA:

1. Na inicializacao, checa se ha update disponivel (timeout 10s)
2. Se houver → mostra `UpdateModal` com opcao de atualizar ou pular
3. Se aceitar → baixa e recarrega o app

---

## Player

O player usa `react-native-webview` carregando uma URL do EmbedPlay:

1. `POST /streams/start` → obtem `streamId`
2. WebView carrega URL do EmbedPlay
3. Ping a cada 60s (`PUT /streams/:id/ping`)
4. Ao sair → `DELETE /streams/:id`
5. Se ping retorna 404 → sessao encerrada (outro dispositivo), mostra overlay

---

## Subscription Gate

Usuarios sem assinatura ativa podem navegar, mas:

- Botao "Assistir" fica desabilitado (icone de cadeado)
- Banner sobre o backdrop indica necessidade de assinar
- Clicar no banner → navega para tela de Planos
- Hook `useSubscription` centraliza a logica (`canWatch`, `isExpired`)
