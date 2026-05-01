# WavePlay — Regras de Negócio (Backend + Mobile)

---

## 1. Planos

### Models envolvidos: `Plan`, `User`

| Regra | Descrição |
|-------|-----------|
| Todo usuário deve ter um plano | Ao registrar, o user recebe o plano padrão (Básico) |
| Plano define limite de perfis | `plan.maxProfiles` controla quantos perfis o user pode criar |
| Plano define limite de telas | `plan.maxStreams` controla quantas reproduções simultâneas |
| Planos inativos não podem ser assinados | `plan.active = false` impede novas assinaturas mas não afeta quem já tem |

### Planos iniciais

| Plano | Slug | Perfis | Telas | Preço |
|-------|------|--------|-------|-------|
| Básico | basico | 1 | 1 | R$ 0 (free) |
| Padrão | padrao | 3 | 2 | R$ 19,90 |
| Premium | premium | 5 | 4 | R$ 39,90 |

---

## 1.1. Subscription Gate (Bloqueio no App)

### Contexto: Verificacao de assinatura no app mobile

| Regra | Descrição |
|-------|-----------|
| Navegacao livre | Usuario sem assinatura pode navegar pelo catalogo normalmente |
| Bloqueio no detalhe | Telas de MovieDetail e SeriesDetail bloqueiam o botao "Assistir" |
| Banner sobre backdrop | Banner clicavel sobre a imagem principal indica necessidade de assinar |
| Clique no banner | Navega direto para a tela de Planos |
| Episodios bloqueados | Em series, clicar no episodio nao navega ao Player |

### Condicoes de bloqueio

| Condicao | Descricao |
|----------|-----------|
| `user.subscription === null` | Usuario sem assinatura |
| `subscription.endsAt !== null && endsAt < now` | Assinatura vencida |
| `subscription.endsAt === null` | Sem expiracao (assinatura valida) |

### Mensagens do banner

| Estado | Mensagem |
|--------|----------|
| Sem assinatura | "Assine um plano para assistir" |
| Assinatura vencida | "Sua assinatura expirou. Renove para continuar assistindo" |

### Hook `useSubscription`

```
canWatch = subscription !== null && !isExpired
isExpired = subscription.endsAt !== null && new Date(endsAt) < new Date()
```

---

## 2. Autenticação

### Models envolvidos: `User`, `RefreshToken`

| Regra | Descrição |
|-------|-----------|
| Email único | Não pode existir dois usuários com o mesmo email |
| Senha mínima 8 caracteres | Validação no register via Zod |
| Senha salva com Argon2id | Parâmetros: memoryCost=65536 (64MB), timeCost=3, parallelism=1 |
| Access token expira em 15 minutos | JWT stateless, validado pela assinatura |
| Refresh token expira em 48 horas | Salvo como SHA-256 no banco |
| Refresh token é single-use | Ao usar, o token atual é revogado e um novo é gerado |
| Rotação por family | Cada login cria uma nova family. Refresh herda a mesma family |
| Detecção de roubo | Se um token revogado for reutilizado → revogar TODOS os tokens da family |
| Múltiplos dispositivos permitidos | Cada login cria uma sessão (family) independente |
| Account lockout | 5 tentativas falhas de login → conta bloqueada por 30min (contador em Redis com TTL) |
| Rate limit no refresh | Max 10 requests de refresh por minuto por IP |
| Transporte do refresh token | Header `X-Platform: mobile` → refresh token no body. Qualquer outro valor ou ausente → httpOnly cookie (padrão web) |
| Logout geral | POST /auth/logout-all revoga todas as families do usuário |

### Fluxo de autenticação

```
Register → cria user + hash senha + plano Básico → retorna tokens
Login    → verifica lockout → valida email + argon2 verify → gera family → retorna tokens
Refresh  → valida hash do token → revoga atual → gera novo com mesma family
Logout   → revoga todos tokens da family
Logout-all → revoga TODAS as families do user
```

### Transporte de tokens por plataforma

```
Mobile (X-Platform: mobile):
  Response body: { accessToken, refreshToken }
  App salva refreshToken no expo-secure-store

Web (padrão, sem header):
  Response body: { accessToken }
  Response cookie: Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/auth
  Browser envia cookie automaticamente no /auth/refresh
```

### Password Reset

| Regra | Descrição |
|-------|-----------|
| Token por email | POST /auth/forgot-password envia email com token de reset |
| Token curto | Expira em 15 minutos, single-use |
| Salvo como hash | Token salvo como SHA-256 no banco (igual refresh token) |
| Reset efetivo | POST /auth/reset-password valida token → atualiza senha → revoga TODAS as families |

### Change Password (logado)

| Regra | Descrição |
|-------|-----------|
| Acesso | `Profile → Minha Conta → "Alterar senha"` abre `ChangePasswordScreen` |
| Endpoint | `PATCH /auth/password` (rota protegida via JWT) |
| Validação client-side | Schema Zod idêntico ao backend: 8+ chars, 1 maiúscula, 1 minúscula, 1 número |
| `confirmPassword` apenas no frontend | Validação de UX (anti-typo). Backend recebe só `{ currentPassword, newPassword }` |
| Senha diferente da atual | Validação client-side via `.refine()` impede submit com `newPassword === currentPassword` |
| Sessão atual preservada | Após sucesso, **não** chama `signOut`. Backend revoga as outras sessões via `revokeAllByUserId` |
| Outros devices deslogados | Outros aparelhos com refresh token antigo recebem 401 no próximo refresh — `setOnUnauthorized` redireciona pra Login |
| Feedback | `Alert.alert` no sucesso (com botão OK que chama `navigation.goBack()`). `apiError` inline no erro (mensagem do backend) |
| Toggle Mostrar/Ocultar | Cada um dos 3 inputs tem state local de visibilidade (igual padrão do `LoginScreen`) |

---

## 3. Perfis

### Models envolvidos: `Profile`, `User`, `Plan`

| Regra | Descrição |
|-------|-----------|
| Limite de perfis por plano | `COUNT(profiles) < user.plan.maxProfiles` para criar novo |
| Primeiro perfil automático | Ao registrar, cria perfil com o nome do user automaticamente |
| Nome obrigatório | Perfil precisa ter nome (min 1 caractere) |
| Perfil infantil | `isKid = true` pode futuramente filtrar conteúdo adulto |
| Deleção em cascata | Deletar perfil remove seus favoritos, watchlist, progresso e histórico |
| Perfil não pode ser deletado se for o último | User deve ter pelo menos 1 perfil |

---

## 4. Controle de Telas Simultâneas

### Models envolvidos: `ActiveStream`, `User`, `Plan`

| Regra | Descrição |
|-------|-----------|
| Limite por plano | `COUNT(active_streams WHERE lastPing > 2min atrás) < user.plan.maxStreams` |
| Heartbeat obrigatório | Player envia ping a cada 60 segundos |
| Timeout de 2 minutos | Stream sem ping há 2 minutos é considerada inativa |
| Uma stream por perfil | Cada perfil só pode ter 1 reprodução ativa (`@@unique([userId, profileId])`) |
| Limpeza automática | Cron job remove streams com lastPing > 2 minutos |

### Fluxo de reprodução

```
1. App chama POST /streams/start { profileId, tmdbId, type, title }
2. Backend conta streams ativas do user (lastPing > 2min atrás)
3. Se count >= plan.maxStreams → 409 com lista de streams ativas
4. Se ok → cria/atualiza ActiveStream → retorna streamId
5. Player chama PUT /streams/:id/ping a cada 60s
6. Ao sair do player → DELETE /streams/:id
7. Se app crashar → stream expira sozinha após 2min sem ping
8. Se ping retorna 404 → sessão foi encerrada por outro dispositivo
```

### Quando o limite é atingido (409 Conflict)

```
App mostra modal com lista de streams ativas:
  "Você atingiu o limite de X telas simultâneas"
  [Stream 1 - titulo] [Encerrar]
  [Stream 2 - titulo] [Encerrar]

Ao encerrar uma stream → retry automático do start
```

### Sessão encerrada (404 no ping)

```
App mostra overlay fullscreen:
  "Sua sessão foi encerrada em outro dispositivo"
  [Voltar] → navigation.goBack()
```

---

## 5. Favoritos

### Models envolvidos: `Favorite`, `Profile`

| Regra | Descrição |
|-------|-----------|
| Vinculado ao perfil | Cada perfil tem seus próprios favoritos |
| Toggle (add/remove) | Se já é favorito, remove. Se não é, adiciona |
| Unicidade por perfil + tmdb + type | Mesmo conteúdo não pode ser favoritado duas vezes no mesmo perfil |
| Sem limite de quantidade | Usuário pode favoritar quantos quiser |

---

## 6. Watchlist (Assistir Depois)

### Models envolvidos: `WatchlistItem`, `Profile`

| Regra | Descrição |
|-------|-----------|
| Vinculado ao perfil | Cada perfil tem sua própria watchlist |
| Toggle (add/remove) | Mesmo comportamento dos favoritos |
| Unicidade por perfil + tmdb + type | Sem duplicatas |
| Sem limite de quantidade | Sem restrição |
| Independente dos favoritos | Pode estar na watchlist E nos favoritos ao mesmo tempo |

---

## 7. Progresso de Reprodução

### Models envolvidos: `Progress`, `Profile`

| Regra | Descrição |
|-------|-----------|
| Vinculado ao perfil | Cada perfil tem seu próprio progresso |
| Upsert | Se já existe progresso para o conteúdo, atualiza. Se não, cria |
| Debounce em memória | App salva progresso em memória a cada 5 segundos (não a cada frame) |
| Sync periódico | App envia progresso para API a cada 5 minutos (backup contra crash) |
| Flush ao sair | App salva progresso imediatamente na API ao sair do player |
| Identificação por conteúdo | Filme: `tmdbId + type`. Série: `tmdbId + type + season + episode` |
| Continue watching | Conteúdo com progresso > 0% e < 90% aparece em "Continue Assistindo" |
| Conteúdo assistido | Progresso >= 90% da duração é considerado "assistido" |

---

## 8. Histórico

### Models envolvidos: `HistoryItem`, `Profile`

| Regra | Descrição |
|-------|-----------|
| Vinculado ao perfil | Cada perfil tem seu próprio histórico |
| Adicionado ao iniciar reprodução | Registra quando o user começa a assistir |
| Atualiza se já existe | Se assistir de novo o mesmo conteúdo, atualiza o watchedAt |
| Limite de 50 itens por perfil | Os mais antigos são removidos quando exceder |
| Limpar histórico | User pode limpar todo o histórico do perfil |
| Ordenado por data | Mais recente primeiro |

---

## 9. Catálogo (Proxy TMDB)

### Sem model — dados vêm do TMDB via proxy

| Regra | Descrição |
|-------|-----------|
| Token TMDB no backend | App nunca acessa TMDB direto. Todas as chamadas passam pela API |
| Cache Redis | Respostas do TMDB são cacheadas para reduzir latência e requests |
| TTL do cache por tipo | Trending: 1h, Detail: 24h, Search: 30min, Lists (incluindo by-watch-providers): 1h |
| Idioma pt-BR | Todas as chamadas ao TMDB usam `language=pt-BR` |
| Fallback sem cache | Se Redis estiver fora, busca direto do TMDB (sem cache) |
| Carouseis por streaming na Home | 4 carouseis no fim da HomeScreen (Netflix, Disney+, Max, Prime Video) com filmes+séries mesclados, ordenados por popularity. Animação sequencial via `AnimatedSection` com delays 700/800/900/1000. Carousel oculto quando `data.results.length === 0` |
| Constants providers | `WATCH_PROVIDERS` em `src/constants/watch-providers.ts` define ID TMDB + slug + título. Mesmo array do web pra paridade |

---

## 10. Regras Gerais

| Regra | Descrição |
|-------|-----------|
| Rate limiting | Max 10 requests por minuto por IP nos endpoints: login, refresh, forgot-password, reset-password |
| Todas as rotas protegidas | Exceto: register, login, refresh, forgot-password, reset-password |
| Ownership de perfil | Toda operação com profileId valida que `profile.userId === auth.userId` |
| Response padronizado | `{ success: boolean, data?: T, error?: E[] }` |
| Soft delete de refresh tokens | Nunca hard delete — manter para auditoria de segurança |
| Cascata nas deleções | Deletar user → deleta profiles → deleta favoritos, watchlist, progresso, histórico |
| UUIDs como ID | Todos os models usam UUID v7 (ordenável por tempo, gerado no app via `uuidv7`) |

---

## 11. Segurança

### HTTPS & Headers

| Regra | Descrição |
|-------|-----------|
| HTTPS obrigatório | Produção deve forçar HTTPS. HTTP redireciona para HTTPS |
| HSTS | Header `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| Helmet | Ativado com configuração customizada |
| CSP | `Content-Security-Policy: default-src 'self'` |
| X-Frame-Options | `DENY` — previne clickjacking |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |

### CORS

| Regra | Descrição |
|-------|-----------|
| Origens explícitas | Lista de domínios permitidos (não usar `*`) |
| Credentials | `true` — necessário para envio de cookies httpOnly |
| Methods | `GET, POST, PUT, PATCH, DELETE` |
| Allowed headers | `Authorization, Content-Type, X-Platform` |

### Token Storage por Plataforma

| Plataforma | Access Token | Refresh Token |
|------------|-------------|---------------|
| Mobile (React Native) | `expo-secure-store` (Keychain/Keystore) | `expo-secure-store` (Keychain/Keystore) |
| Web (Browser) | Memória (variável JS, nunca localStorage) | httpOnly cookie (Secure, SameSite=Strict) |

### Audit Logging

| Evento | Log |
|--------|-----|
| Login falho | IP, email tentado, timestamp |
| Account lockout | IP, email, duração do bloqueio |
| Theft detection | Family afetada, IP do request suspeito |
| Token revogado | Motivo (logout, refresh, theft), family |
| Password reset solicitado | Email, IP |

---

## Atualizacoes de versao

| Regra | Descricao |
|-------|-----------|
| Versao instalada | Lida via `Application.nativeApplicationVersion` (vem de `app.json` `expo.version`) |
| Versao no servidor | `GET /app/version` retorna a versao current marcada pelo admin no painel web |
| Comparacao | Lib `semver` (`semver.lt(current, latest)`) — suporta prerelease (ex: `1.0.0-beta.1`) |
| Force update | Quando flag `forceUpdate: true` no server, modal nao pode ser fechado |
| Plataforma | Apenas Android — iOS nao distribuido fora da App Store |
| DEV bypass | Em `__DEV__`, check e ignorado para nao atrapalhar desenvolvimento |
| Fallback offline | Se API offline ou timeout (10s), app abre normalmente sem modal |
| Erro 404 | Quando nao ha versao publicada (`NoCurrentVersionError`), tratado como erro silencioso |
| Persistencia do dismiss | Estado `updateDismissed` e local — modal reaparece em cada cold start ate o user atualizar |
