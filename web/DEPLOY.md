# Deploy da Plataforma Web — Vercel + Neon

Guia manual completo para colocar o `web/` (Next.js) no ar com banco **Neon
Postgres**. Inclui **todos os comandos**, inclusive o SQL a rodar no Neon.

> Tudo que depende de você (criar contas, copiar segredos, clicar em botões)
> está marcado com **[MANUAL]**. O resto são comandos para colar no terminal.

---

## ⚡ Estado atual (já feito)

O site **já está no ar** na Vercel:

- **Produção:** https://web-chi-steel-vkvjxysg1y.vercel.app
- Projeto Vercel: `thyagos-projects-2a538c0c/web` (Next.js, deploy de `web/`).
- `AUTH_SECRET` e `DEVICE_TOKEN_PEPPER` já configurados (production/preview/development).

A **landing e as telas públicas funcionam**. Para habilitar login/cadastro e os
dashboards, falta **conectar o banco Neon** (passos abaixo). Resumo do que falta:

1. Criar o banco no Neon (passo 1) e copiar as connection strings.
2. Aplicar o schema (passo 3) — `0000_init.sql`.
3. Adicionar `DATABASE_URL` (e `DATABASE_URL_UNPOOLED`) na Vercel:
   ```bash
   cd web
   printf '%s' "<sua DATABASE_URL pooled>"   | npx vercel env add DATABASE_URL production
   printf '%s' "<sua DATABASE_URL unpooled>" | npx vercel env add DATABASE_URL_UNPOOLED production
   npx vercel deploy --prod --yes   # redeploy para pegar as novas envs
   ```
   (repita o `env add` para `preview`/`development` se quiser previews com banco.)
4. (Opcional) Clima: `npx vercel env add INMET_STATION production` com o código da
   estação (ex.: `A652`).

> O CLI já está autenticado como `thyago10a2007-3550`. Os IDs do projeto ficam em
> `web/.vercel/` (gitignorado).

---

## 0. Pré-requisitos

- Conta no **GitHub** com este repositório enviado (push).
- Conta na **Vercel** → https://vercel.com (login com o GitHub). **[MANUAL]**
- Conta no **Neon** → https://neon.tech (login com o GitHub). **[MANUAL]**
- Node 20+ e npm instalados localmente (já temos Node 24).

Instale as dependências do app uma vez:

```bash
cd web
npm install
```

---

## 1. Criar o banco no Neon **[MANUAL]**

1. Em https://console.neon.tech → **New Project**.
2. Nome: `plantiumai`. Região: a mais próxima (ex.: `AWS São Paulo` ou `US East`).
3. Postgres: deixe a versão padrão (16+). Clique **Create**.
4. Na tela do projeto, abra **Connect** / **Connection Details** e copie **DUAS** strings:
   - **Pooled** (tem `-pooler` no host) → vira `DATABASE_URL` (runtime serverless).
   - **Direct / Unpooled** (sem `-pooler`) → vira `DATABASE_URL_UNPOOLED` (migrações).
   - Marque a opção que inclui `?sslmode=require`.

Exemplo do formato:

```
postgresql://neondb_owner:SENHA@ep-cool-name-123456-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
postgresql://neondb_owner:SENHA@ep-cool-name-123456.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

> O Neon cria o database `neondb` e o role `neondb_owner` automaticamente — não
> precisa criar usuário/DB manualmente.

---

## 2. Gerar segredos da aplicação

No terminal (Git Bash):

```bash
# Segredo da sessão Auth.js
openssl rand -base64 32

# Segredo (pepper) do hash dos tokens de firmware
openssl rand -base64 32
```

Guarde os dois valores — viram `AUTH_SECRET` e `DEVICE_TOKEN_PEPPER`.

Crie `web/.env.local` (copiando de `.env.example`) e preencha:

```bash
cd web
cp .env.example .env.local
# edite .env.local com as strings do Neon e os segredos gerados
```

---

## 3. Aplicar o schema no Neon (criar as tabelas)

Você tem **três** caminhos equivalentes — escolha um.

### Opção A — Drizzle migrate (recomendado, versionado)

Usa a connection **unpooled** para rodar o DDL:

```bash
cd web
# Windows PowerShell:
$env:DATABASE_URL = (Get-Content .env.local | Select-String 'DATABASE_URL_UNPOOLED=').ToString().Split('=',2)[1].Trim('"')
npm run db:migrate

# Git Bash / Linux:
export DATABASE_URL="<sua DATABASE_URL_UNPOOLED>"
npm run db:migrate
```

### Opção B — Drizzle push (rápido, sem arquivo de migração)

```bash
cd web
export DATABASE_URL="<sua DATABASE_URL_UNPOOLED>"
npm run db:push
```

### Opção C — Colar SQL no Neon **[MANUAL]**

No console do Neon → **SQL Editor** → cole o conteúdo de
[`web/drizzle/0000_init.sql`](./drizzle/0000_init.sql) → **Run**.

> Para **regenerar** o SQL após mudar `src/db/schema.ts`: `npm run db:generate`.

Confira que as tabelas foram criadas:

```sql
-- rode no SQL Editor do Neon
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
```

Deve listar: `accounts, companies, device_tokens, locations, readings,
sensors, sessions, users, verification_tokens`.

---

## 4. Importar o projeto na Vercel **[MANUAL]**

1. https://vercel.com → **Add New… → Project** → importe o repositório do GitHub.
2. **Root Directory**: clique em **Edit** e selecione **`web`** (o app não está na raiz!).
3. Framework Preset: **Next.js** (detectado automaticamente).
4. **Build Command** / **Output**: deixe o padrão do Next.
5. Em **Environment Variables**, adicione (Production **e** Preview):

   | Nome | Valor |
   |------|-------|
   | `DATABASE_URL` | string **pooled** do Neon |
   | `DATABASE_URL_UNPOOLED` | string **unpooled** do Neon |
   | `AUTH_SECRET` | 1º `openssl rand -base64 32` |
   | `DEVICE_TOKEN_PEPPER` | 2º `openssl rand -base64 32` |

   > `AUTH_URL` **não** é necessária na Vercel — o Auth.js usa o host do deploy.
   > Defina-a apenas no `.env.local` para desenvolvimento (`http://localhost:3000`).

6. Clique **Deploy**. Ao terminar, abra a URL `*.vercel.app`.

### Integração nativa (alternativa à mão)

Na Vercel, **Storage → Marketplace → Neon** cria o banco e injeta `DATABASE_URL`
automaticamente no projeto. Se usar isso, ainda rode o **passo 3** (migração) com
a string unpooled e adicione `DATABASE_URL_UNPOOLED`, `AUTH_SECRET` e
`DEVICE_TOKEN_PEPPER`.

---

## 5. Pós-deploy: testar

1. Acesse `https://SEU-APP.vercel.app` → landing.
2. **Criar conta** → cria empresa + usuário admin → redireciona para `/app`.
3. **Tokens** → gere um token (copie o valor mostrado uma única vez).

---

## 6. Conectar o firmware (ESP32)

O firmware envia leituras para `POST /api/ingest` com o token no header.

Endpoint: `https://SEU-APP.vercel.app/api/ingest`

```bash
curl -X POST https://SEU-APP.vercel.app/api/ingest \
  -H "Authorization: Bearer plt_xxxxxxxx_seusegredo" \
  -H "Content-Type: application/json" \
  -d '{
    "sensorId": "UUID-DO-SENSOR",
    "soil_moisture": 42.5,
    "air_temperature": 24.1,
    "air_humidity": 60,
    "co2_level": 800,
    "ph_level": 6.4
  }'
```

Resposta `{"ok":true}` = leitura gravada. Erros: `invalid_token` (401),
`sensor_not_found` (404), `rate_limited` (429).

> O `sensorId` vem da tabela `sensors`. O cadastro de sensores pela UI entra na
> próxima rodada; por ora, insira um sensor manualmente (passo 7).

---

## 7. Comandos SQL úteis no Neon (SQL Editor)

```sql
-- Listar empresas e usuários
SELECT c.name AS empresa, u.name, u.login, u.role
FROM users u JOIN companies c ON c.id = u.company_id;

-- Criar um local (estufa) para uma empresa
INSERT INTO locations (company_id, name, type)
VALUES ('<COMPANY_UUID>', 'Estufa 1', 'estufa');

-- Cadastrar um sensor manualmente (enquanto não há UI de CRUD)
INSERT INTO sensors (company_id, location_id, name, type)
VALUES ('<COMPANY_UUID>', '<LOCATION_UUID>', 'ESP32 Estufa 1', 'estacao_completa')
RETURNING id;   -- use este id como "sensorId" no firmware

-- Ver as últimas leituras de um sensor
SELECT ts, soil_moisture, air_temperature, co2_level, ph_level
FROM readings WHERE sensor_id = '<SENSOR_UUID>'
ORDER BY ts DESC LIMIT 50;

-- Revogar um token comprometido
UPDATE device_tokens SET revoked = true WHERE prefix = '<PREFIXO>';

-- Promover um usuário a admin da empresa
UPDATE users SET role = 'empresa' WHERE login = '<LOGIN>';
```

---

## 8. Checklist de segurança

- [ ] `AUTH_SECRET` e `DEVICE_TOKEN_PEPPER` são aleatórios (32 bytes) e **só** em env vars.
- [ ] `.env.local` **nunca** commitado (já está no `.gitignore`).
- [ ] Connection string do Neon usa `sslmode=require`.
- [ ] Headers de segurança e CSP ativos (ver `next.config.mjs`).
- [ ] Senhas com bcrypt (custo 12); tokens de firmware guardados só como hash HMAC.
- [ ] Rate limiting na rota `/api/ingest` (e nas de auth via Auth.js).
- [ ] Em produção multi-instância, troque o rate limiter em memória por Upstash Redis.

---

## 9. Problemas comuns

| Sintoma | Causa provável | Correção |
|---|---|---|
| Build falha: `DATABASE_URL não definida` | env var ausente na Vercel | adicione em Settings → Environment Variables e redeploy |
| `password authentication failed` | string errada / role | recopie do Neon; confira `sslmode=require` |
| 404 nas rotas | Root Directory errado | defina **`web`** como Root Directory na Vercel |
| `db:migrate` trava | usou a string **pooled** | migrações exigem a **unpooled** (sem `-pooler`) |
| Sessão cai ao trocar de deploy | `AUTH_SECRET` mudou | use o mesmo valor fixo em todos os ambientes |

---

Referência de arquitetura: `Brain/doc/concepts/plataforma-web-arquitetura.md`.
