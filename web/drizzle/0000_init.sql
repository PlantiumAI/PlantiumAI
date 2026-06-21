-- PlantiumAI Web — migração inicial do schema (Neon Postgres).
-- Gerado a partir de src/db/schema.ts. Pode ser recriado com: npm run db:generate
-- Para aplicar: npm run db:migrate  (ou cole este SQL no SQL Editor do Neon).

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE "account_type" AS ENUM ('empresa', 'cliente');
CREATE TYPE "location_type" AS ENUM ('estufa', 'plantacao_vertical', 'container');
CREATE TYPE "sensor_type" AS ENUM (
  'estacao_completa', 'soil_moisture', 'soil_temperature', 'air_temperature',
  'air_humidity', 'light_level', 'co2_level', 'ph_level'
);

-- ── Empresas ─────────────────────────────────────────────────
CREATE TABLE "companies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(160) NOT NULL,
  "email" varchar(255) NOT NULL,
  "address" text,
  "latitude" real,
  "longitude" real,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ── Usuários ─────────────────────────────────────────────────
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(120) NOT NULL,
  "login" varchar(64) NOT NULL,
  "email" varchar(255) NOT NULL,
  "email_verified" timestamptz,
  "image" text,
  "password_hash" text,
  "role" account_type NOT NULL DEFAULT 'cliente',
  "company_id" uuid REFERENCES "companies"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "users_login_idx" ON "users" ("login");
CREATE UNIQUE INDEX "users_email_idx" ON "users" ("email");
CREATE INDEX "users_company_idx" ON "users" ("company_id");

-- ── Auth.js (OAuth futuro) ───────────────────────────────────
CREATE TABLE "accounts" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  PRIMARY KEY ("provider", "provider_account_id")
);

CREATE TABLE "sessions" (
  "session_token" text PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires" timestamptz NOT NULL
);

CREATE TABLE "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamptz NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- ── Locais ───────────────────────────────────────────────────
CREATE TABLE "locations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "name" varchar(120) NOT NULL,
  "type" location_type NOT NULL,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "locations_company_idx" ON "locations" ("company_id");

-- ── Tokens de dispositivo ────────────────────────────────────
CREATE TABLE "device_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "prefix" varchar(12) NOT NULL,
  "token_hash" text NOT NULL,
  "label" varchar(120),
  "revoked" boolean NOT NULL DEFAULT false,
  "last_used_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "device_tokens_prefix_idx" ON "device_tokens" ("prefix");
CREATE INDEX "device_tokens_company_idx" ON "device_tokens" ("company_id");

-- ── Sensores ─────────────────────────────────────────────────
CREATE TABLE "sensors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "location_id" uuid REFERENCES "locations"("id") ON DELETE SET NULL,
  "device_token_id" uuid REFERENCES "device_tokens"("id") ON DELETE SET NULL,
  "name" varchar(120) NOT NULL,
  "type" sensor_type NOT NULL DEFAULT 'estacao_completa',
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "sensors_company_idx" ON "sensors" ("company_id");
CREATE INDEX "sensors_location_idx" ON "sensors" ("location_id");

-- ── Leituras ─────────────────────────────────────────────────
CREATE TABLE "readings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "sensor_id" uuid NOT NULL REFERENCES "sensors"("id") ON DELETE CASCADE,
  "soil_moisture" real,
  "air_temperature" real,
  "air_humidity" real,
  "light_level" real,
  "soil_temperature" real,
  "co2_level" real,
  "ph_level" real,
  "source" varchar(32) NOT NULL DEFAULT 'firmware',
  "ts" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "readings_sensor_ts_idx" ON "readings" ("sensor_id", "ts");
