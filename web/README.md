# PlantiumAI Web

Plataforma web (SaaS) do PlantiumAI: landing institucional + painel autenticado
para empresas e clientes acompanharem sensores de cultivo. Deploy na **Vercel**,
banco **Neon Postgres**.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Auth.js (NextAuth v5)** — sessão JWT, papéis `empresa` / `cliente`
- **Drizzle ORM** + `@neondatabase/serverless`
- Segurança: bcrypt, HMAC nos tokens de dispositivo, CSP/headers, rate limiting

## Estrutura

```
web/
├─ drizzle/0000_init.sql      # migração inicial (DDL completo)
├─ src/
│  ├─ app/
│  │  ├─ page.tsx             # landing (/)
│  │  ├─ login, signup/       # autenticação
│  │  ├─ app/                 # painel protegido (/app/*)
│  │  │  ├─ page.tsx          # visão geral (KPIs)
│  │  │  ├─ locais, sensores, tokens, usuarios/
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/  # Auth.js
│  │     └─ ingest/           # ingestão de leituras do firmware
│  ├─ auth.ts, auth.config.ts, middleware.ts
│  ├─ db/ (schema.ts, index.ts)
│  ├─ lib/ (password, device-token, sensor-rules, rate-limit)
│  └─ components/
└─ DEPLOY.md                  # passo-a-passo Vercel + Neon (com SQL)
```

## Desenvolvimento

```bash
cd web
npm install
cp .env.example .env.local      # preencha DATABASE_URL (Neon) + segredos
npm run db:push                 # cria as tabelas no Neon
npm run dev                     # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `typecheck`, `db:generate`, `db:migrate`,
`db:push`, `db:studio`.

## Deploy

Veja **[DEPLOY.md](./DEPLOY.md)** — guia manual completo (Vercel + Neon + comandos SQL).

## Modelo de papéis

- **empresa** — admin: gerencia locais, sensores, tokens e usuários da empresa.
- **cliente** — acesso de leitura aos dados (a ser refinado nas próximas rodadas).

## Implementado

- Landing + auth (signup cria empresa) + painel protegido.
- Geração/revogação de tokens de firmware; ingestão em `/api/ingest`.
- **CRUD de locais e sensores** pela UI.
- **Dashboards por tipo de sensor** (gráficos recharts, valor atual e status).

## Roadmap (próximas rodadas)

- CRUD/convite de usuários (clientes) por e-mail; OAuth Google.
- Acesso de leitura para o papel `cliente`.
- Alertas e histórico com filtros de período.
- Decisão de irrigação por IA (portar gateway multi-provider do legado).
