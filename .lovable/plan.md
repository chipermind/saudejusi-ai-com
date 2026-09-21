# MASTER PROJECT AUDIT — SaudeJusia

Modo READ-ONLY: nada foi alterado em código, banco, RLS, migrations, rotas, dependências ou configuração. Este documento é relatório, não implementação.

---

## 1. EXECUTIVE SUMMARY

SaudeJusia é hoje um produto B2C construído sobre um projeto originalmente B2B ("Defere"). O rebrand ocorreu na camada pública; a camada B2B continua viva no repositório e no banco.

Estado real verificado:
- Landing pública e waitlist: completas e operacionais (2 registros na waitlist).
- Documentos legais: versão preliminar 1.0, com placeholders pendentes.
- Motor de IA B2C: backend completo (4 endpoints + expurgo), sem interface. Nunca executou: `ai_prompt_runs` = 0, `ai_artifacts` = 0.
- Painel B2B `/app`: código completo, base zerada (0 casos, 0 advogados, 0 escritórios), dashboard com dados mockados.
- Auth: 1 usuário. Email/senha + link por email.
- `ARTIFACT_ENCRYPTION_KEY` e `CRON_SECRET` não configurados (decisão sua): persistência cifrada e expurgo desligados, com degradação controlada.

Risco dominante: um finding P0 de escalonamento de privilégio em `lawyers`. Fora isso, a base de segurança de dados é sólida (RLS em 12/12 tabelas) e a dívida concentra-se em duplicação B2B/B2C e na ausência de camada de dados no frontend.

---

## 2. ARCHITECTURE MAP

```text
Browser (React 19 + TanStack Router)
  +-- Rotas públicas (SSR): landing, waitlist, legal, auth
  +-- /minha-conta (B2C)  -> guard em useEffect (inconsistente)
  +-- /app* (B2B legado)  -> guard em beforeLoad
  |
  +-- supabase-js (anon, RLS) ------------> Postgres (12 tabelas, RLS on)
  +-- authedFetch (Bearer) --> Server routes (Cloudflare Worker)
        +-- /api/ia/saudejusia/{analyze,classify,extract,generate}   (B2C)
        +-- /api/ia/{classify-denial,extract-document,
        |            generate-deliverable,estimate-jurimetrics}      (B2B)
        +-- /api/public/hooks/expurgar-artifacts                     (cron)
              +-- ai-endpoint-handler.server.ts
              |     auth -> rate limit -> IA -> Zod+guardrails
              |     -> artifact cifrado -> telemetria
              +-- supabaseAdmin (service role)
              +-- Lovable AI Gateway (Gemini 2.5 pro/flash)
              +-- Storage privado: case-artifacts, case-documents
```

Não existem `src/start.ts`, react-query nem route loaders: todo fetch é client-side em `useEffect`.

---

## 3. FEATURE INVENTORY

| Feature | Estado |
|---|---|
| Landing pública B2C | Completa (5 âncoras válidas) |
| Waitlist (honeypot, unique email, Plausible) | Completa e endurecida |
| Páginas legais | Preliminar 1.0, com placeholders |
| Auth email/senha + link por email | Funcional |
| Recuperação de senha | Duplicada em 2 rotas |
| Motor IA B2C (4 tarefas) | Backend pronto, sem UI |
| Rate limiting por plano | Implementado, atômico via RPC |
| Guardrails (injection, frases proibidas, retry) | Implementado |
| Artifacts cifrados AES-256-GCM | Implementado, desligado |
| Expurgo automático | Implementado, desligado (pg_cron ausente) |
| `/minha-conta` | Stub "Em construção" |
| Painel B2B `/app` | Legado, KPIs mockados |
| Jurimetria / Jurisprudência / Minutas | Não existem (menu desabilitado) |

---

## 4. ROUTE MAP

Públicas: `/`, `/waitlist`, `/login`, `/cadastro`, `/recuperar-senha`, `/esqueci-senha`, `/redefinir-senha`, `/confirmar-email`, `/termos`, `/privacidade`, `/lgpd`.
Redirects 301: `/signup` e `/demo` para `/waitlist`.
Protegidas: `/minha-conta`, `/app`, `/app/casos`, `/app/casos/novo`, `/app/casos/$id`.
API: 4 B2C, 4 B2B, 1 de artifact (GET/DELETE), 1 cron público.
Referenciadas e inexistentes: `/app/jurimetria`, `/app/jurisprudencia`, `/app/minutas` — renderizadas desabilitadas, sem 404.

---

## 5. DATA MODEL (verificado no banco)

12 tabelas em `public`, RLS habilitada em todas. Contagens reais: waitlist 2, auth.users 1, demais 0. 18 migrations. Buckets `case-artifacts` e `case-documents`, privados.

| Tabela | Policies | anon | authenticated | Observação |
|---|---|---|---|---|
| waitlist | 2 | INSERT | INSERT | endurecida corretamente |
| profiles | 2 | — | S/I/U/D | sem policy de INSERT |
| lawyers | 2 | S/I/U/D | S/I/U/D | UPDATE sem WITH CHECK (P0) |
| law_firms | 1 | S/I/U/D | S/I/U/D | só SELECT tem policy |
| cases / case_documents / case_deliverables | 1 cada | S/I/U/D | S/I/U/D | FOR ALL por `current_law_firm_id()` |
| ai_calls_log | 1 | S/I/U/D | S/I/U/D | só SELECT tem policy |
| demo_requests | 1 | S/I/U/D | S/I/U/D | só INSERT tem policy |
| ai_artifacts | 1 | SELECT | SELECT | leitura própria, não deletada |
| ai_prompt_runs / ai_rate_limits | 0 | — | — | deny-all, só service_role |

---

## 6. SECURITY AUDIT

**P0 — `lawyers`: UPDATE sem WITH CHECK.** A policy restringe qual linha pode ser alterada (`id = auth.uid()`), mas não o conteúdo. Um advogado autenticado pode mudar o próprio `role` para owner ou trocar de `law_firm_id` e passar a enxergar casos, documentos e entregáveis de outro escritório. Confirmado por scanner e por leitura do schema. Mitigante hoje: tabela vazia.

**P1 — Grants amplos em 7 tabelas.** `anon` tem SELECT/INSERT/UPDATE/DELETE em `cases`, `case_documents`, `case_deliverables`, `lawyers`, `law_firms`, `ai_calls_log`, `demo_requests`. Hoje tudo é barrado pela RLS: sem exposição confirmada. É defesa em profundidade ausente — qualquer policy futura mal escrita vira exposição imediata.

**P2 — Funções SECURITY DEFINER executáveis por anon/authenticated** (2 warnings de scanner). `signup_create_firm` precisa disso para authenticated; `current_law_firm_id` e `increment_rate_limit` não precisam de EXECUTE para anon.

**P2 — `process.env.SUPABASE_URL!` / `SUPABASE_PUBLISHABLE_KEY!`** com non-null assertion em 5 arquivos: se faltarem, o erro é exceção opaca no SDK, não 500 diagnosticável — diferente de `LOVABLE_API_KEY`, `ARTIFACT_ENCRYPTION_KEY` e `CRON_SECRET`, todos guardados.

**P2 — CORS `Access-Control-Allow-Origin: *`** nos endpoints de IA. Sem CSRF (auth por header, não cookie), mas mais permissivo que o necessário.

**P3 — Endpoints B2B sem rate limit.** `classify-denial` e `extract-document` chamam o gateway sem teto por escritório.

Positivos confirmados: RLS em 100% das tabelas; AES-256-GCM + HKDF nos artifacts; comparação constant-time no cron; 404 em vez de 403 em artifact alheio; telemetria sem PII; waitlist com grant mínimo, honeypot e unique em `lower(email)`.

---

## 7. BUGS / FUNCTIONAL RISKS

1. P1 — `api.ia.saudejusia.extract.ts`: `AI_PAYMENT_REQUIRED` é retentado 3× e devolvido como 422 "não conseguimos interpretar o documento", em vez de 402/503. O handler genérico trata certo; o extract diverge.
2. P1 — `/app/casos/$id` sem estado de erro: falha na query deixa a tela presa em "Carregando..." para sempre.
3. P1 — `/app/casos` ignora o `error` do banco: falha aparece como lista vazia.
4. P2 — `api.ia.generate-deliverable.ts` é stub (`model: "stub-v1"`, delay simulado, texto placeholder) exposto entre endpoints reais.
5. P2 — `estimate-jurimetrics` grava em `ai_calls_log` como se fosse chamada de modelo, distorcendo custo de IA; é cálculo determinístico local.
6. P2 — Dashboard `/app` exibe KPIs e casos recentes 100% mockados como se fossem reais.
7. P2 — Botões sem handler em `/app/casos/$id` ("Editar", "Arquivar", "Exportar").
8. P2 — `redefinir-senha.tsx` usa timeout de 2,5s para decidir que o link é inválido: corrida se o servidor demorar.
9. P3 — Plausible aponta para `defere-ia-com.lovable.app`, mas o publicado é `saudejusia-ai-com.lovable.app`: provavelmente nenhuma conversão está sendo contabilizada. REQUIRES RUNTIME VALIDATION.
10. P3 — Duas rotas de recuperação de senha, a segunda ainda com copy B2B ("email profissional").

---

## 8. TECHNICAL DEBT

- Prompts de extração B2B marcados `@deprecated` ainda em uso, paralelos ao caminho B2C.
- Duas tabelas de telemetria para o mesmo conceito (`ai_calls_log` e `ai_prompt_runs`).
- Loop de retry/telemetria/persistência duplicado entre o handler genérico e `extract.ts` — já dessincronizado (bug 1).
- `corsHeaders` e helper `json()` replicados 6×; auth Bearer copiada 4× nas rotas B2B.
- `bytesToBase64` reimplementado 2×.
- Colisão de nome `AiTask` entre `ai-schemas.ts` e `ai-rate-limits.server.ts`.
- Zero react-query e zero loaders; guard de auth inconsistente entre `/app` e `/minha-conta`.
- `app.casos.novo.tsx` com 813 linhas.

---

## 9. UX / UI / RESPONSIVIDADE / ACESSIBILIDADE

- Design tokens bem aplicados: só 1 cor crua fora de `components/ui` (`bg-black/60`).
- Sidebar do `/app` fixa em 240px, sem versão móvel — maior risco de responsividade.
- `SiteHeader` esconde a navegação abaixo de `md` sem menu alternativo.
- Busca do `/app` só com placeholder, sem label nem `aria-label`.
- Tabelas sem `scope="col"` e sem `<caption>`.
- Nenhuma rota `/app/*` define `head()`: herdam título da home e não têm `noindex` (`/minha-conta` faz certo).
- Positivos: labels e `aria-label` corretos nas páginas de auth e waitlist; honeypot acessível; estados de loading/sucesso/erro consistentes nos formulários públicos.

---

## 10. PERFORMANCE

- Sem imagens e sem fontes remotas: bundle leve. `recharts` e `embla-carousel` são pesados para o uso atual.
- `/app/casos/$id` faz 3 buscas sequenciais (caso, documentos, entregáveis) em vez de paralelas.
- Sem cache: cada navegação refaz tudo.
- Endpoints de IA podem chamar o gateway 3× em falha de validação: custo e latência até 3×.

---

## 11. DEAD CODE / DUPLICATION

`generate-deliverable` (stub); `safeDebugLog` (nunca chamada); `generateMasterKeyBase64` (ops); `callAiWithImage` (substituída); `AiTask` de `ai-schemas.ts` (sem import); `/esqueci-senha` (um único link de borda); `<Link to="/blog">` comentado no footer; TODO de depoimentos placeholder.

---

## 12. DEPENDENCY AUDIT

Todas as vulnerabilidades reportadas são transitivas, vindas de ferramentas de build (`@cloudflare/vite-plugin`, `@tailwindcss/vite`, `@tanstack/*`): `seroval` (crítica), `undici`, `sharp/libvips`, `postcss`, `nanoid`, `js-yaml`, `ws`, `browserslist`. Nenhuma tem correção direta no pacote de primeiro nível: dependem de release upstream. Risco prático baixo, exceto `seroval`, que participa da serialização SSR — REQUIRES RUNTIME VALIDATION. Higiene: `vitest` está em `dependencies` e `nitro` está pinado em beta.

---

## 13. FAILURE MODES

| Falha | Comportamento | Avaliação |
|---|---|---|
| `LOVABLE_API_KEY` ausente | throw, 500 genérico | aceitável |
| `ARTIFACT_ENCRYPTION_KEY` ausente | 200 com aviso; GET de artifact 503 | degradação correta |
| `CRON_SECRET` ausente | 503, fail-closed | correto |
| `SUPABASE_URL` ausente | exceção opaca no SDK | P2 |
| Gateway 429 | 429 com `retry_at` | correto |
| Gateway 402 | correto no handler; 422 enganoso no extract | bug 1 |
| Saída inválida do modelo | 3 tentativas, depois 422 | correto |
| Upload de artifact falha | 200 com aviso, storage limpo | correto |
| Telemetria falha | engolida | correto |
| Query do painel falha | tela presa em "Carregando..." | bugs 2 e 3 |
| Expurgo nunca roda | artifacts expirados acumulam | hoje inócuo |

---

## 14. PRIORITY MATRIX

| # | Finding | Sev | Impacto | Esforço | Regressão |
|---|---|---|---|---|---|
| 1 | `lawyers` UPDATE sem WITH CHECK | P0 | Alto | Baixo | Baixo |
| 2 | Plausible com domínio errado | P1 | Alto | Muito baixo | Nenhum |
| 3 | 402 retentado e mascarado no extract | P1 | Médio | Baixo | Baixo |
| 4 | Telas de caso sem estado de erro | P1 | Médio | Baixo | Baixo |
| 5 | Grants amplos em 7 tabelas | P1 | Alto (condicional) | Médio | Médio |
| 6 | `/app/*` sem `noindex` | P2 | Médio | Muito baixo | Nenhum |
| 7 | Dashboard com dados mock | P2 | Médio | Médio | Baixo |
| 8 | EXECUTE de funções definer para anon | P2 | Médio | Baixo | Médio |
| 9 | `/app` sem responsividade móvel | P2 | Médio | Médio | Baixo |
| 10 | B2B sem rate limit | P3 | Médio (custo) | Médio | Baixo |
| 11 | Duplicação B2B/B2C e rotas de senha | P3 | Baixo | Alto | Alto |

---

## 15. QUICK WINS

1. Corrigir `data-domain` do Plausible.
2. `WITH CHECK` na policy de UPDATE de `lawyers`.
3. `head()` com `noindex` nas 4 rotas `/app/*`.
4. Curto-circuitar `AI_PAYMENT_REQUIRED` no extract.
5. Tratar `error` nas queries de `/app/casos` e `/app/casos/$id`.
6. Trocar `bg-black/60` por token.
7. `aria-label` na busca do `/app`.
8. Mover `vitest` para devDependencies.

---

## 16. STRUCTURAL IMPROVEMENTS

- Introduzir react-query + loaders e padronizar o guard de auth.
- Extrair um núcleo único de chamada de IA (retry, telemetria, persistência) que aceite JSON e multipart.
- Unificar telemetria em uma tabela.
- Decidir o destino do B2B: congelar formalmente ou remover.
- Aplicar grants mínimos em todas as tabelas, como já feito na waitlist.

---

## 17. DO NOT TOUCH YET

Painel `/app` e endpoints `api.ia.*` B2B; redirects `/signup` e `/demo`; copy, preços, FAQ, depoimentos e seção "Sobre"; prompts e guardrails (26 testes); tabela `waitlist` e suas policies; textos legais pendentes de preenchimento.

---

## 18. RUNTIME VALIDATION REQUIRED

Plausible está recebendo eventos? Fluxos de link por email e redefinição de senha em produção. Um POST autenticado real a `/api/ia/saudejusia/classify` (nunca houve execução). `/app` em viewport móvel. Exposição real da falha `seroval` na serialização SSR. Contraste dos tokens de cor.

---

## 19. RECOMMENDED EXECUTION ORDER (sem implementar)

1. P0 de segurança: `WITH CHECK` em `lawyers`.
2. Quick wins de uma linha: Plausible, `noindex`, `aria-label`, token de cor.
3. Bugs de estado: 402 no extract, erro nas telas de caso.
4. Decisão sobre grants amplos e EXECUTE das funções definer.
5. Responsividade do `/app` ou congelamento explícito.
6. Dashboard: dado real ou rótulo de exemplo.
7. Camada de dados antes da UI do motor B2C.
8. Só então desduplicação B2B/B2C e consolidação das rotas de senha.

---

## 20. PROJECT BASELINE

- **Propósito:** IA informativa para beneficiários de plano de saúde entenderem negativas e próximos passos. Não é advogado, não representa, não promete resultado.
- **Stack:** TanStack Start v1, React 19, Vite 7, Tailwind v4, shadcn; Cloudflare Worker; Lovable Cloud (Postgres, Auth, Storage); Lovable AI Gateway (Gemini 2.5).
- **Rotas:** 11 públicas, 2 redirects, 5 protegidas, 10 de API.
- **Features:** landing e waitlist prontas; motor de IA pronto no backend, sem UI; painel B2B legado congelado.
- **Auth:** email/senha + link por email; 1 usuário; sem OAuth por decisão.
- **Modelo de dados:** 12 tabelas, RLS em todas, 18 migrations, 2 buckets privados; base essencialmente vazia.
- **Integrações:** Lovable AI Gateway, Plausible (domínio desalinhado), Storage.
- **Findings críticos/altos:** `lawyers` sem WITH CHECK (P0); Plausible cego (P1); 402 mascarado (P1); telas sem erro (P1); grants amplos (P1).
- **Dívida:** duplicação B2B/B2C, duas tabelas de telemetria, ausência de camada de dados.
- **Validação em runtime pendente:** Plausible, fluxos de auth, primeira execução do motor, mobile do `/app`.
- **Próxima ação recomendada:** corrigir o P0 da policy de `lawyers` e o domínio do Plausible.
