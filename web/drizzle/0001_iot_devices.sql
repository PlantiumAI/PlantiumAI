-- PlantiumAI Web — migração 0001: infraestrutura IoT real.
-- Dispositivos físicos, atuadores, regras de automação, fila de comandos
-- cloud→device e alertas persistidos. Espelha src/db/schema.ts.
-- Para aplicar: npm run db:migrate (ou cole no SQL Editor do Neon).

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE "device_status" AS ENUM ('never_seen', 'online', 'offline');
CREATE TYPE "actuator_type" AS ENUM (
  'pump', 'valve', 'fan', 'exhaust', 'led_panel', 'relay', 'heater'
);
CREATE TYPE "command_status" AS ENUM ('pending', 'sent', 'acked', 'failed', 'expired');
CREATE TYPE "alert_severity" AS ENUM ('info', 'atencao', 'critico');
CREATE TYPE "command_issuer" AS ENUM ('user', 'automation');

-- ── Dispositivos ─────────────────────────────────────────────
CREATE TABLE "devices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "location_id" uuid REFERENCES "locations"("id") ON DELETE SET NULL,
  "name" varchar(120) NOT NULL,
  "model" varchar(40) NOT NULL DEFAULT 'esp32',
  "firmware_version" varchar(40),
  "status" device_status NOT NULL DEFAULT 'never_seen',
  "last_seen_at" timestamptz,
  "config" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "devices_company_idx" ON "devices" ("company_id");
CREATE INDEX "devices_location_idx" ON "devices" ("location_id");

-- ── Vínculo token/sensor → device (compat: nullable) ─────────
ALTER TABLE "device_tokens"
  ADD COLUMN "device_id" uuid REFERENCES "devices"("id") ON DELETE CASCADE;
ALTER TABLE "sensors"
  ADD COLUMN "device_id" uuid REFERENCES "devices"("id") ON DELETE SET NULL;

-- ── Atuadores ────────────────────────────────────────────────
CREATE TABLE "actuators" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "location_id" uuid REFERENCES "locations"("id") ON DELETE SET NULL,
  "device_id" uuid NOT NULL REFERENCES "devices"("id") ON DELETE CASCADE,
  "name" varchar(120) NOT NULL,
  "type" actuator_type NOT NULL,
  "channel" integer NOT NULL DEFAULT 0,
  "is_on" boolean NOT NULL DEFAULT false,
  "level" integer,
  "state_updated_at" timestamptz,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "actuators_company_idx" ON "actuators" ("company_id");
CREATE INDEX "actuators_device_idx" ON "actuators" ("device_id");

-- ── Regras de automação ──────────────────────────────────────
CREATE TABLE "automation_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "location_id" uuid REFERENCES "locations"("id") ON DELETE CASCADE,
  "name" varchar(120) NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true,
  "trigger" jsonb NOT NULL,
  "action" jsonb NOT NULL,
  "cooldown_s" integer NOT NULL DEFAULT 300,
  "last_fired_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "automation_rules_company_idx" ON "automation_rules" ("company_id");
CREATE INDEX "automation_rules_location_idx" ON "automation_rules" ("location_id");

-- ── Fila de comandos cloud → device ──────────────────────────
CREATE TABLE "device_commands" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "device_id" uuid NOT NULL REFERENCES "devices"("id") ON DELETE CASCADE,
  "actuator_id" uuid REFERENCES "actuators"("id") ON DELETE CASCADE,
  "command" jsonb NOT NULL,
  "status" command_status NOT NULL DEFAULT 'pending',
  "issued_by" command_issuer NOT NULL DEFAULT 'user',
  "rule_id" uuid REFERENCES "automation_rules"("id") ON DELETE SET NULL,
  "detail" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "sent_at" timestamptz,
  "acked_at" timestamptz,
  "expires_at" timestamptz
);
CREATE INDEX "device_commands_device_status_idx" ON "device_commands" ("device_id", "status");

-- ── Alertas persistidos ──────────────────────────────────────
CREATE TABLE "alerts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "location_id" uuid REFERENCES "locations"("id") ON DELETE CASCADE,
  "sensor_id" uuid REFERENCES "sensors"("id") ON DELETE SET NULL,
  "severity" alert_severity NOT NULL DEFAULT 'info',
  "metric" varchar(40),
  "value" real,
  "message" text NOT NULL,
  "resolved" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "resolved_at" timestamptz
);
CREATE INDEX "alerts_company_idx" ON "alerts" ("company_id", "resolved");
